import type { Board, BoardCoordinate } from "@entities";
import type { ResolveMeleePhaseState } from "@game";

/**
 * Gets the set of board spaces still awaiting melee resolution for this phase.
 *
 * @param phaseState - Narrowed resolve-melee phase state
 * @returns The remaining engagements set (same reference as on the phase state)
 */
export function getRemainingMeleeEngagements(
  phaseState: ResolveMeleePhaseState,
): Set<BoardCoordinate<Board>> {
  return phaseState.remainingEngagements as Set<BoardCoordinate<Board>>;
}
