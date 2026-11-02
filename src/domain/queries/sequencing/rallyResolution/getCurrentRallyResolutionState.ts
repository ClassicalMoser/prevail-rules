import type { GameState, RallyResolutionState } from '@game';
import { throwIfPending } from '@utils';
import { getCleanupPhaseState } from '../phases/getCleanupPhaseState';

/**
 * Gets the current rally resolution state based on the cleanup phase step.
 * Assumes we're in a resolveRally step (validation should happen elsewhere).
 *
 * @param state - The game state
 * @returns The rally resolution state for the current step
 * @throws Error if not in a resolveRally step or rally resolution state is missing
 */
export function getCurrentRallyResolutionState(
  state: GameState,
): RallyResolutionState {
  const phaseState = getCleanupPhaseState(state);
  const { step } = phaseState;

  if (step === 'firstPlayerResolveRally') {
    return throwIfPending(
      phaseState.firstPlayerRallyResolutionState,
      'No first player rally resolution state found',
    );
  }

  if (step === 'secondPlayerResolveRally') {
    return throwIfPending(
      phaseState.secondPlayerRallyResolutionState,
      'No second player rally resolution state found',
    );
  }

  throw new Error(`Not in a resolveRally step: ${step}`);
}
