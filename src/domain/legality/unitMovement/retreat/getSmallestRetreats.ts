import type { RetreatOption } from '@game';
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
 * @returns The smallest endings, each with one path; empty when there are none
 */
export function getSmallestRetreats(endings: Set<MoveResult>): RetreatOption[] {
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

  // One option per ending: a second path to the same place is no choice.
  const options: RetreatOption[] = [];
  for (const ending of smallest) {
    const alreadyOffered = options.some((option) =>
      isSamePlacement(option.placement, ending.placement),
    );
    if (!alreadyOffered) {
      options.push({ path: [...ending.path], placement: ending.placement });
    }
  }
  return options;
}
