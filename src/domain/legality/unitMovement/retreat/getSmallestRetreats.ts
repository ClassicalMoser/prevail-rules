import type { MoveDelta } from '@entities';
import { isSamePlacement } from '@queries';
import type { MoveResult } from '../explore';

/**
 * The smallest of a retreat's legal endings (§9.1.3): the fewest facing
 * changes first, then the fewest steps. A retreat is a fall-back, not a
 * free repositioning, so only the cheapest are offered; where several tie,
 * the retreating player chooses among them.
 *
 * A retreat is judged by where it ends, so each ending is offered once, by
 * the first path found to it (author, 2026-11-09: two equally small paths to
 * one ending are exceptionally rare and never significant).
 *
 * @param endings - Every legal ending of the retreat, with its cost
 * @returns The paths of the smallest retreats, one per ending; empty when there are none
 */
export function getSmallestRetreats(endings: Set<MoveResult>): MoveDelta[][] {
  const all = [...endings];

  // Fewest turns first: a retreat should not wheel when it can fall straight
  // back.
  const fewestTurns = Math.min(...all.map((ending) => ending.flexibilityUsed));
  const leastTurned = all.filter(
    (ending) => ending.flexibilityUsed === fewestTurns,
  );

  // Then, among those, the fewest steps: no further back than it must go.
  const fewestSteps = Math.min(
    ...leastTurned.map((ending) => ending.speedUsed),
  );
  const smallest = leastTurned.filter(
    (ending) => ending.speedUsed === fewestSteps,
  );

  // One path per ending: a second path to the same place is no choice.
  const kept: MoveResult[] = [];
  for (const ending of smallest) {
    const alreadyOffered = kept.some((other) =>
      isSamePlacement(other.placement, ending.placement),
    );
    if (!alreadyOffered) {
      kept.push(ending);
    }
  }
  const paths = kept.map((ending) => [...ending.path]);
  return paths;
}
