import type { MoveDelta } from '@entities';
import type { MoveResult } from '../explore';
import { compareMoveSize, getSmallestMovePerEnding } from '../size';

/**
 * The smallest of a retreat's legal endings (§9.1.3): the fewest facing
 * changes first (the least rotation, since a retreat only turns 45°), then the fewest steps. A retreat is a fall-back, not a
 * free repositioning, so only the cheapest are offered; where several tie,
 * the retreating player chooses among them.
 *
 * A retreat is judged by where it ends — its space and its facing — so each
 * ending is offered once, by the first path found to it (author, 2026-11-09: two equally small paths to
 * one ending are exceptionally rare and never significant).
 *
 * @param endings - Every legal ending of the retreat, with its cost
 * @returns The paths of the smallest retreats, one per ending; empty when there are none
 */
export function getSmallestRetreats(endings: Set<MoveResult>): MoveDelta[][] {
  const all = [...endings];

  // With no legal ending there is no retreat to offer.
  const [first, ...rest] = all;
  if (first === undefined) {
    return [];
  }

  // Fewest turns first: a retreat should not wheel when it can fall straight
  // back. Then, among those, the fewest steps: no further back than it must go.
  const smallestSize = rest.reduce(
    (smallestSoFar, ending) =>
      compareMoveSize(ending, smallestSoFar) < 0 ? ending : smallestSoFar,
    first,
  );
  const smallest = all.filter(
    (ending) => compareMoveSize(ending, smallestSize) === 0,
  );

  // One path per ending: a second path to the same place is no choice.
  const onePerEnding = getSmallestMovePerEnding(smallest);
  const paths = onePerEnding.map((ending) => [...ending.path]);
  return paths;
}
