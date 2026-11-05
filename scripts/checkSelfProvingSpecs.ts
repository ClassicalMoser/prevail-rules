import { glob, readFile } from 'node:fs/promises';
import path from 'node:path';
import { boundaries } from '../boundaries';

/**
 * Finds specs that prove themselves.
 *
 * A spec is self-proving when something it imports ends up calling the very
 * function under test. The assertion then agrees with the subject instead of
 * checking it, so the test passes whatever the subject does and a rule can
 * break without the suite noticing.
 *
 * This is not circularity. Nothing imports a spec, so a spec can never sit on
 * an import cycle, and a path such as
 * `isFriendlyUnit.test.ts -> addUnitToBoard -> isFriendlyUnit` is a legal DAG
 * that passes every boundary check. Only reachability finds it.
 *
 * Run with `pnpm check:selfProof`. Throws when any spec is flagged.
 */

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');

/** One import or re-export, holding the names taken as values. */
interface Edge {
  /** The imported bindings, or `['*']` for a namespace or whole-module import. */
  names: string[];
  /** The specifier as written, alias or relative. */
  spec: string;
}

/** A spec whose setup or assertion reaches its own subject. */
interface SelfProof {
  /** The spec's path, relative to `src`. */
  spec: string;
  /** Each binding that reaches the subject, with where it is declared. */
  via: string[];
}

/** Import alias to the directory it stands for, read off `boundaries.ts`. */
const aliasDirs = new Map<string, string>(
  boundaries.map(
    (boundary) =>
      [
        // `alias` is what an import says; `identifier` is required and matches
        // it for every boundary here, so it stands in when alias is unset.
        boundary.alias ?? boundary.identifier,
        path.join(SRC, boundary.dir),
      ] as const,
  ),
);

/**
 * Matches one import or re-export, capturing everything between the keyword and
 * the specifier as a clause for the parser below. A clause cannot hold a quote,
 * so it stops at the specifier and never runs into the next statement.
 */
const STATEMENT =
  /(?:^|\n)[\t ]*(?:import|export)\b(?<clause>[^'"]*)'(?<spec>[^']+)'/gu;

/** Matches a brace clause, whose contents are the named bindings. */
const BRACES = /\{(?<names>[\s\S]*)\}/u;

/** Matches a clause that imports types only, which call nothing. */
const TYPE_ONLY = /^\s*type\b/u;

/** Matches a default or namespace binding in a clause with no braces. */
const BARE_BINDING = /^\s*(?:\*\s+as\s+)?(?<binding>\w+)/u;

/** Matches a value declaration of one name, which ends the search for it. */
function declarationOf(name: string): RegExp {
  return new RegExp(
    `export(?:[\\t ]+async)?[\\t ]+(?:function|const|let|class)[\\t ]+${name}\\b`,
    'u',
  );
}

/**
 * Reads the value edges out of one module's source.
 *
 * @param source - The module's text
 * @returns Its imports and re-exports, type-only edges dropped
 */
function readEdges(source: string): Edge[] {
  const edges: Edge[] = [];
  for (const match of source.matchAll(STATEMENT)) {
    const clause = match.groups?.clause ?? '';
    const spec = match.groups?.spec;
    if (spec === undefined || TYPE_ONLY.test(clause)) {
      continue;
    }
    const braced = BRACES.exec(clause)?.groups?.names;
    let names: string[];
    if (braced !== undefined) {
      names = braced
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.length > 0 && !part.startsWith('type '))
        .map((part) => (part.split(/\s+as\s+/u)[0] ?? part).trim());
    } else {
      const bare = BARE_BINDING.exec(clause)?.groups?.binding;
      // A namespace import pulls in whatever the module holds.
      names = bare === undefined ? ['*'] : [bare];
    }
    edges.push({ names, spec });
  }
  return edges;
}

// Every module is read once up front, so the walk below touches no disk.
const relativePaths = await Array.fromAsync(glob('**/*.ts', { cwd: SRC }));
const files = relativePaths.map((relative) => path.join(SRC, relative));
const sources = new Map<string, string>(
  await Promise.all(
    files.map(async (file) => [file, await readFile(file, 'utf8')] as const),
  ),
);
const present = new Set(files);

/**
 * Turns a specifier into the file it loads.
 *
 * @param fromFile - The importing module, for relative specifiers
 * @param spec - The specifier as written
 * @returns The file, or null for an external package
 */
function resolveSpec(fromFile: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith('@')) {
    const [aliasName, ...rest] = spec.split('/');
    const dir = aliasDirs.get(aliasName ?? '');
    if (!dir) {
      return null;
    }
    base = rest.length > 0 ? path.join(dir, rest.join('/')) : dir;
  } else if (spec.startsWith('.')) {
    base = path.resolve(path.dirname(fromFile), spec);
  } else {
    // An external package cannot reach back into this source tree.
    return null;
  }
  for (const candidate of [base, `${base}.ts`, path.join(base, 'index.ts')]) {
    if (present.has(candidate)) {
      return candidate;
    }
  }
  return null;
}

const edgesByFile = new Map<string, Edge[]>();
for (const [file, source] of sources) {
  edgesByFile.set(file, readEdges(source));
}

const declarationSites = new Map<string, string | null>();

/**
 * Follows a name through the barrels to the module that declares it. Stopping
 * at the barrel instead would make almost everything reach almost everything,
 * because a layer's barrel re-exports the whole layer.
 *
 * @param file - The module the name was imported from
 * @param name - The binding to chase
 * @param seen - Names already being chased, to stop a re-export loop
 * @returns The declaring module, or null if the name cannot be placed
 */
function findDeclaration(
  file: string,
  name: string,
  seen = new Set<string>(),
): string | null {
  const key = `${file}#${name}`;
  const cached = declarationSites.get(key);
  if (cached !== undefined) {
    return cached;
  }
  if (seen.has(key)) {
    return null;
  }
  seen.add(key);

  let site: string | null = null;
  const source = sources.get(file) ?? '';
  if (name === '*' || declarationOf(name).test(source)) {
    // Declared here, or a whole-module import that stops at this module.
    site = file;
  } else {
    // Otherwise this module re-exports it; follow the edge that carries it.
    for (const edge of edgesByFile.get(file) ?? []) {
      if (!edge.names.includes(name) && !edge.names.includes('*')) {
        continue;
      }
      const next = resolveSpec(file, edge.spec);
      if (next === null) {
        continue;
      }
      const found = findDeclaration(next, name, seen);
      if (found !== null) {
        site = found;
        break;
      }
    }
  }
  declarationSites.set(key, site);
  return site;
}

// The graph is built at declaration level, so an edge is a real call target.
const callGraph = new Map<string, Set<string>>();
for (const file of files) {
  const targets = new Set<string>();
  for (const edge of edgesByFile.get(file) ?? []) {
    const module = resolveSpec(file, edge.spec);
    if (module === null) {
      continue;
    }
    for (const name of edge.names) {
      const site = findDeclaration(module, name);
      if (site !== null) {
        targets.add(site);
      }
    }
  }
  callGraph.set(file, targets);
}

/**
 * Whether any call path from one module arrives at another. Specs are never
 * stepped through: nothing imports them, so no path runs on through one.
 *
 * @param start - The module to walk from
 * @param goal - The subject being looked for
 * @returns Whether the subject is reachable
 */
function reaches(start: string, goal: string): boolean {
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) {
      break;
    }
    for (const next of callGraph.get(current) ?? []) {
      if (next === goal) {
        return true;
      }
      if (seen.has(next) || next.endsWith('.test.ts')) {
        continue;
      }
      seen.add(next);
      queue.push(next);
    }
  }
  return false;
}

// A spec's subject is the module beside it under the same name.
const specs = files.filter((file) => file.endsWith('.test.ts'));
const flagged: SelfProof[] = [];
let checked = 0;

for (const spec of specs) {
  const subject = spec.replace(/\.test\.ts$/u, '.ts');
  if (!present.has(subject)) {
    continue;
  }
  checked++;

  const via = new Set<string>();
  for (const edge of edgesByFile.get(spec) ?? []) {
    const module = resolveSpec(spec, edge.spec);
    if (module === null) {
      continue;
    }
    for (const name of edge.names) {
      const site = findDeclaration(module, name);
      // Importing the subject itself is the point of the spec.
      if (site === null || site === subject) {
        continue;
      }
      if (reaches(site, subject)) {
        via.add(`${name} (${path.relative(SRC, site)})`);
      }
    }
  }
  if (via.size > 0) {
    flagged.push({ spec: path.relative(SRC, spec), via: [...via] });
  }
}

// The whole report goes out in one write, so one print site carries the rule.
const report: string[] = [
  `${checked} specs with a colocated subject, of ${specs.length}.`,
];

if (flagged.length === 0) {
  report.push('No spec reaches its own subject.');
} else {
  report.push('', `${flagged.length} spec(s) reach their own subject:`, '');
  for (const { spec, via } of flagged) {
    report.push(`  ${spec}`);
    for (const reachedBy of via) {
      report.push(`      via ${reachedBy}`);
    }
  }
  report.push(
    '',
    'The assertion agrees with the subject rather than checking it. Build the',
    'expected value as a literal, or assert through something that does not',
    'call the subject.',
  );
}

// eslint-disable-next-line no-console
console.log(report.join('\n'));

if (flagged.length > 0) {
  throw new Error(`${flagged.length} self-proving spec(s)`);
}
