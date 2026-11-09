import type { UnitPlacement } from '@entities';
import type { MoveResult } from '../explore';

/**
 * The smallest of a retreat's legal endings (§9.1.3): the fewest facing
 * changes first, then the fewest steps. A retreat is a fall-back, not a
 * free repositioning, so only the cheapest are offered; where several tie,
 * the retreating player chooses among them.
 *
 * @param endings - Every legal ending of the retreat, with its cost
 * @returns The placements of the smallest endings; empty when there are none
 */
export function getSmallestRetreats(
  endings: Set<MoveResult>,
): Set<UnitPlacement> {
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

  const placements = new Set(smallest.map((ending) => ending.placement));
  return placements;
}
