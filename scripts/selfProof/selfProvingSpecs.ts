import path from 'node:path';
import type { CallGraph } from './callGraph';
import type { SelfProof } from './selfProof';
import { reachesModule } from './reachesModule';
import type { SourceTree } from './sourceTree';

/**
 * Finds the specs that prove themselves.
 *
 * A spec is self-proving when something it calls ends up running the very
 * function under test. The assertion then agrees with the subject instead of
 * checking it, so the test passes whatever the subject does.
 *
 * @param tree - The source tree, for its file list
 * @param graph - The call graph to walk
 * @param srcDir - The source directory, for reporting short paths
 * @returns One entry per self-proving spec
 */
export function selfProvingSpecs(
  tree: SourceTree,
  graph: CallGraph,
  srcDir: string,
): SelfProof[] {
  const proofs: SelfProof[] = [];

  for (const spec of tree.files) {
    if (!spec.endsWith('.test.ts')) {
      continue;
    }
    // A spec's subject is the module beside it under the same name. A spec
    // with none asserts across modules and has no single subject to protect.
    const subject = spec.replace(/\.test\.ts$/u, '.ts');
    if (!tree.files.has(subject)) {
      continue;
    }

    const through = new Set<string>();
    for (const target of graph.get(spec) ?? []) {
      // Calling the subject is the point of the spec. Anything else that
      // leads back to it is the problem.
      if (target === subject) {
        continue;
      }
      if (reachesModule(graph, target, subject)) {
        const shortPath = path.relative(srcDir, target);
        through.add(shortPath);
      }
    }

    if (through.size > 0) {
      const proof: SelfProof = {
        spec: path.relative(srcDir, spec),
        through: [...through],
      };
      proofs.push(proof);
    }
  }

  return proofs;
}
