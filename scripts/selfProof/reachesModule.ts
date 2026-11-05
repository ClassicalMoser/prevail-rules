import type { CallGraph } from './callGraph';

/**
 * Whether any call path from one module arrives at another.
 *
 * Specs are never stepped through. Nothing imports a spec, so no call path
 * runs on through one, and treating a spec as a step would invent routes that
 * cannot happen.
 *
 * @param graph - The call graph to walk
 * @param start - The module to walk from
 * @param goal - The module being looked for
 * @returns Whether the goal is reachable
 */
export function reachesModule(
  graph: CallGraph,
  start: string,
  goal: string,
): boolean {
  // Breadth first, so a short route to the subject is found before a long one
  // and nothing is walked twice.
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) {
      break;
    }
    for (const next of graph.get(current) ?? []) {
      // One call away from the subject is enough; the route is already proved.
      if (next === goal) {
        return true;
      }
      // Already walked, or a spec, which is never a step on a path.
      if (seen.has(next) || next.endsWith('.test.ts')) {
        continue;
      }
      seen.add(next);
      queue.push(next);
    }
  }
  // Every route out of the start was followed and none arrived.
  return false;
}
