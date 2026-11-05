import { glob, readFile } from 'node:fs/promises';
import path from 'node:path';
import { boundaries } from '../../boundaries';

/**
 * Builds the call graph of this package's source.
 *
 * An edge means "this module calls something that module declares". That is
 * narrower than "imports from": a name taken from a layer's barrel is followed
 * through to the module that declares it, because stopping at the barrel would
 * make every module reach every other one in the same layer.
 *
 * Type-only imports are left out. A type is never called, so it cannot carry
 * behaviour from one module to another.
 */

/** One import or re-export, holding the names taken as values. */
interface Edge {
  /** The imported bindings, or `['*']` for a namespace or whole-module import. */
  names: string[];
  /** The specifier as written, alias or relative. */
  spec: string;
}

/** The source tree, read once, with its call edges resolved. */
export interface ImportGraph {
  /** Every `.ts` file under `src`, specs included. */
  files: string[];
  /** Whether a path is one of those files, for resolving a specifier. */
  holds: (file: string) => boolean;
  /** The modules whose values a given module calls. */
  callsOf: (file: string) => ReadonlySet<string>;
}

/**
 * Matches one import or re-export, capturing everything between the keyword and
 * the specifier as a clause for {@link parseClause}. A clause cannot hold a
 * quote, so it stops at the specifier and never runs into the next statement.
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
 * Reads the bindings out of one import clause.
 *
 * @param clause - The text between the keyword and the specifier
 * @returns The names taken, or null when the clause is type-only
 */
function parseClause(clause: string): string[] | null {
  if (TYPE_ONLY.test(clause)) {
    return null;
  }
  const braced = BRACES.exec(clause)?.groups?.names;
  if (braced !== undefined) {
    return braced
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0 && !part.startsWith('type '))
      .map((part) => (part.split(/\s+as\s+/u)[0] ?? part).trim());
  }
  const bare = BARE_BINDING.exec(clause)?.groups?.binding;
  // A namespace import pulls in whatever the module holds.
  return bare === undefined ? ['*'] : [bare];
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
    const spec = match.groups?.spec;
    const names = parseClause(match.groups?.clause ?? '');
    if (spec !== undefined && names !== null) {
      edges.push({ names, spec });
    }
  }
  return edges;
}

/**
 * Reads the source tree and resolves every call edge in it.
 *
 * @param srcDir - The `src` directory to read
 * @returns The files and their call edges
 */
export async function buildImportGraph(srcDir: string): Promise<ImportGraph> {
  // Import alias to the directory it stands for, read off boundaries.ts, so
  // there is no second list of aliases to keep in step.
  const aliasDirs = new Map<string, string>(
    boundaries.map(
      (boundary) =>
        [
          // `alias` is what an import says; `identifier` is required and
          // matches it for every boundary here, so it stands in when unset.
          boundary.alias ?? boundary.identifier,
          path.join(srcDir, boundary.dir),
        ] as const,
    ),
  );

  // Every module is read once up front, so nothing below touches the disk.
  const relativePaths = await Array.fromAsync(glob('**/*.ts', { cwd: srcDir }));
  const files = relativePaths.map((relative) => path.join(srcDir, relative));
  const sources = new Map<string, string>(
    await Promise.all(
      files.map(async (file) => [file, await readFile(file, 'utf8')] as const),
    ),
  );
  const present = new Set(files);

  const edgesByFile = new Map<string, Edge[]>();
  for (const [file, source] of sources) {
    edgesByFile.set(file, readEdges(source));
  }

  /** Turns a specifier into the file it loads, or null for a package. */
  function resolveSpec(fromFile: string, spec: string): string | null {
    let base: string;
    if (spec.startsWith('@')) {
      const [aliasName, ...rest] = spec.split('/');
      const dir = aliasDirs.get(aliasName ?? '');
      if (dir === undefined) {
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

  const declarationSites = new Map<string, string | null>();

  /** Follows a name through the barrels to the module that declares it. */
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
    if (name === '*' || declarationOf(name).test(sources.get(file) ?? '')) {
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

  const calls = new Map<string, Set<string>>();
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
    calls.set(file, targets);
  }

  return {
    callsOf: (file) => calls.get(file) ?? new Set<string>(),
    files,
    holds: (file) => present.has(file),
  };
}

/**
 * Whether any call path from one module arrives at another. Specs are never
 * stepped through: nothing imports a spec, so no path runs on through one.
 *
 * @param graph - The graph to walk
 * @param start - The module to walk from
 * @param goal - The module being looked for
 * @returns Whether the goal is reachable
 */
export function reaches(
  graph: ImportGraph,
  start: string,
  goal: string,
): boolean {
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) {
      break;
    }
    for (const next of graph.callsOf(current)) {
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
