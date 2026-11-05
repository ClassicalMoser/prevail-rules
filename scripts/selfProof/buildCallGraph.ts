import type { CallGraph } from './callGraph';
import { findDeclaringModule } from './findDeclaringModule';
import type { SourceTree } from './sourceTree';
import { resolveSpecifier } from './resolveSpecifier';

/**
 * Builds the call graph of the source tree.
 *
 * An edge means "this module calls something that module declares", which is
 * narrower than "imports from": a name taken from a layer's barrel is followed
 * through to its declaring module, so one import of a barrel does not read as
 * a call into every module behind it.
 *
 * @param tree - The source tree to read
 * @returns Each module's call targets
 */
export function buildCallGraph(tree: SourceTree): CallGraph {
  // Shared across the whole build, so each name is placed once.
  const declaringModules = new Map<string, string | null>();
  const graph: CallGraph = new Map<string, Set<string>>();

  // Specs are walked too: a spec's own edges are what the check reads.
  for (const file of tree.files) {
    const targets = new Set<string>();
    for (const edge of tree.edges.get(file) ?? []) {
      const module = resolveSpecifier(tree, file, edge.spec);
      // An external package is outside this graph.
      if (module === null) {
        continue;
      }
      // One import can name several bindings, and they may be declared in
      // different modules behind the same barrel.
      for (const name of edge.names) {
        const site = findDeclaringModule(tree, declaringModules, module, name);
        if (site !== null) {
          targets.add(site);
        }
      }
    }
    graph.set(file, targets);
  }

  return graph;
}
