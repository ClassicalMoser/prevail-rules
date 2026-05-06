import type { Board, BoardCoordinate } from "@entities";
import { ResolveMeleePhaseStateForBoard } from "@game";

/**
 * Gets the set of board spaces still awaiting melee resolution for this phase.
 *
 * @param phaseState - Narrowed resolve-melee phase state
 * @returns The remaining engagements set (same reference as on the phase state)
 */
export function getRemainingMeleeEngagements<TBoard extends Board>(
  phaseState: ResolveMeleePhaseStateForBoard<TBoard>,
): Set<BoardCoordinate<TBoard>> {
  return phaseState.remainingEngagements;
}
