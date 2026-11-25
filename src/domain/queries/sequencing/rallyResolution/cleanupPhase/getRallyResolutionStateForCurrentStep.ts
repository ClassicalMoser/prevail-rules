import type { GameState, RallyResolutionState } from '@game';
import { getCleanupPhaseState } from '@queries/sequencing/phases/getCleanupPhaseState';
import { getCurrentRallyResolutionState } from '../getCurrentRallyResolutionState';
import { getRallyingPlayer } from './getRallyingPlayer';

/**
 * Gets the rally resolution state for the current cleanup phase step.
 * Validates that we're in a resolveRally step and that the player matches the expected player for that step.
 *
 * @param state - The game state
 * @param player - The player attempting to access the rally state
 * @returns The rally resolution state for the current step
 * @throws Error if not in a resolveRally step, player doesn't match, or rally state is missing
 */
export function getRallyResolutionStateForCurrentStep(
  state: GameState,
  player: 'white' | 'black',
): RallyResolutionState {
  // The step must be that player's resolve step. The rally itself is read next.
  const phaseState = getCleanupPhaseState(state);
  if (
    phaseState.step !== 'firstPlayerResolveRally' &&
    phaseState.step !== 'secondPlayerResolveRally'
  ) {
    throw new Error(
      `Cleanup phase is not on a resolveRally step: ${phaseState.step}`,
    );
  }
  // Only the player whose step it is may resolve this rally.
  const rallyingPlayer = getRallyingPlayer(state);
  if (player !== rallyingPlayer) {
    throw new Error(
      `Expected ${rallyingPlayer} (${
        phaseState.step === 'firstPlayerResolveRally' ? 'first' : 'second'
      } player) to resolve rally, got ${player}`,
    );
  }

  // TODO(composition): `getCurrentRallyResolutionState` checks the resolve
  // step again, with its own message, and that second check cannot fail once
  // the one above has passed. Settle which of the two owns the step guard.
  // That player's rally.
  return getCurrentRallyResolutionState(state);
}
