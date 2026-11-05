import path from 'node:path';
import { buildImportGraph, reaches } from './importGraph';

/**
 * Finds specs that prove themselves.
 *
 * A spec is self-proving when something it imports ends up calling the very
 * function under test. The assertion then agrees with the subject instead of
 * checking it, so the test passes whatever the subject does and a rule can
 * break with the suite still green.
 *
 * This is not circularity, and no cycle check can replace it. Nothing imports
 * a spec, so a spec can never sit on an import cycle; a path such as
 * `isFriendlyUnit.test.ts -> addUnitToBoard -> isFriendlyUnit` is a legal DAG
 * that passes every boundary rule. Only reachability finds it.
 *
 * Run with `pnpm check:selfProof`, which `pnpm validate` includes.
 */

/** A spec whose setup or assertion reaches its own subject. */
interface SelfProof {
  /** The spec's path, relative to `src`. */
  spec: string;
  /** Each binding that reaches the subject, with where it is declared. */
  via: string[];
}

const SRC = path.resolve(import.meta.dirname, '..', '..', 'src');

const graph = await buildImportGraph(SRC);

// A spec's subject is the module beside it under the same name.
const specs = graph.files.filter((file) => file.endsWith('.test.ts'));
const flagged: SelfProof[] = [];
let checked = 0;

for (const spec of specs) {
  const subject = spec.replace(/\.test\.ts$/u, '.ts');
  if (!graph.holds(subject)) {
    continue;
  }
  checked++;

  const via = new Set<string>();
  for (const target of graph.callsOf(spec)) {
    // Calling the subject is the point of the spec; anything else that leads
    // back to it is the problem.
    if (target === subject) {
      continue;
    }
    if (reaches(graph, target, subject)) {
      via.add(path.relative(SRC, target));
    }
  }
  if (via.size > 0) {
    flagged.push({ spec: path.relative(SRC, spec), via: [...via] });
  }
}

// The whole report goes out in one write, so one print site carries the rule.
const report = [
  `${checked} specs with a colocated subject, of ${specs.length}.`,
];

if (flagged.length === 0) {
  report.push('No spec reaches its own subject.');
} else {
  report.push('', `${flagged.length} spec(s) reach their own subject:`, '');
  for (const { spec, via } of flagged) {
    report.push(`  ${spec}`);
    for (const reachedBy of via) {
      report.push(`      through ${reachedBy}`);
    }
  }
  report.push(
    '',
    'The assertion agrees with the subject rather than checking it. Write the',
    'expected value as a literal, or assert through something that does not',
    'call the subject.',
  );
}

// eslint-disable-next-line no-console
console.log(report.join('\n'));

if (flagged.length > 0) {
  throw new Error(`${flagged.length} self-proving spec(s)`);
}
