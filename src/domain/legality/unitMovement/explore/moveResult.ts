import type { UnitPlacement } from '@entities';

/**
 * One place a move may legally end, with what reaching it costs. Retreats
 * compare these costs to find the smallest legal fall-back (§9.1.3); an
 * advance offers every one of them.
 */
export interface MoveResult {
  /** The placement of the unit after the move. */
  placement: UnitPlacement;
  /** The amount of flexibility used to reach the placement. */
  flexibilityUsed: number;
  /** The amount of speed used to reach the placement. */
  speedUsed: number;
}
