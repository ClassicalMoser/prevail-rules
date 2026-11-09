import type { MoveDelta, UnitPlacement } from '@entities';

/**
 * One place a move may legally end, with what reaching it costs. Retreats
 * compare these costs to find the smallest legal fall-back (§9.1.3); an
 * advance offers every one of them, each with a path a player can submit.
 */
export interface MoveResult {
  /** The placement of the unit after the move. */
  placement: UnitPlacement;
  /** The amount of flexibility used to reach the placement. */
  flexibilityUsed: number;
  /** The amount of speed used to reach the placement. */
  speedUsed: number;
  /**
   * One path that reaches the placement at that cost, ending with the
   * squaring turn when the move closes on an enemy obliquely (§6.2.3). A
   * move event carries a path like this one.
   */
  path: readonly MoveDelta[];
}
