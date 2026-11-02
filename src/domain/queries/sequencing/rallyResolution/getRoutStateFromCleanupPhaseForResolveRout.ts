import type { GameState, RoutState } from '@game';
import { getCleanupPhaseState } from '../phases/getCleanupPhaseState';

/**
 * The rout on the rally for the current cleanup step.
 *
 * On a first-player step, check that player's rally.
 * Otherwise, check the second player's rally.
 * Throw when the rally we checked has no rout.
 *
 * @param state - The game state
 * @returns The rout on that slot
 * @throws Error when the phase is not cleanup, or that rally has no rout yet
 */
export function getRoutStateFromCleanupPhaseForResolveRout(
  state: GameState,
): RoutState {
  const phaseState = getCleanupPhaseState(state);

  // Choose and resolve for the first player share one slot.
  const firstPlayerStep =
    phaseState.step === 'firstPlayerChooseRally' ||
    phaseState.step === 'firstPlayerResolveRally';

  // Every other cleanup step uses the second player's slot.
  const rallyState = firstPlayerStep
    ? phaseState.firstPlayerRallyResolutionState
    : phaseState.secondPlayerRallyResolutionState;

  // No rally opened yet, or a rally that has not routed anyone.
  if (rallyState === 'pending' || rallyState.routState === 'pending') {
    throw new Error('No rout state found in rally resolution');
  }

  return rallyState.routState;
}
