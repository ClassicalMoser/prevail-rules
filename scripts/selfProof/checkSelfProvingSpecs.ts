import path from 'node:path';
import { buildCallGraph } from './buildCallGraph';
import type { CommandResult } from '../commandResult';
import { readSourceTree } from './readSourceTree';
import { reportSelfProofs } from './reportSelfProofs';
import { selfProvingSpecs } from './selfProvingSpecs';

/** The source tree this check reads, relative to this file. */
const SRC = path.resolve(import.meta.dirname, '..', '..', 'src');

/**
 * Fails when any spec proves itself.
 *
 * A spec is self-proving when something it calls ends up running the function
 * under test, so the assertion agrees with the subject rather than checking
 * it and a rule can break with the suite still green.
 *
 * This is not circularity, and no cycle check can stand in for it. Nothing
 * imports a spec, so a spec can never sit on an import cycle; a path such as
 * `isFriendlyUnit.test.ts -> addUnitToBoard -> isFriendlyUnit` is a legal DAG
 * that keeps every boundary rule. Only reachability finds it.
 *
 * @returns The report, with a failure when any spec reaches its own subject
 */
export async function checkSelfProvingSpecs(): Promise<CommandResult> {
  // Read every module once, so neither step below goes back to the disk.
  const tree = await readSourceTree(SRC);

  // Resolve each import to the module that declares what it names, which is
  // what a call actually runs.
  const graph = buildCallGraph(tree);

  // Then ask, of each spec, whether anything but its subject leads back to it.
  const proofs = selfProvingSpecs(tree, graph, SRC);

  // The report says how many specs were checked as well as how many failed,
  // because a spec with no module beside it has no one subject and is skipped.
  // Without the first number the second one reads as a clean bill of health.
  let specs = 0;
  let checked = 0;
  for (const file of tree.files) {
    if (!file.endsWith('.test.ts')) {
      continue;
    }
    specs++;
    const subject = file.replace(/\.test\.ts$/u, '.ts');
    if (tree.files.has(subject)) {
      checked++;
    }
  }

  const report = reportSelfProofs(proofs, checked, specs);
  const failure =
    proofs.length > 0 ? `${proofs.length} self-proving spec(s)` : null;
  const result: CommandResult = { failure, output: report.join('\n') };
  return result;
}
