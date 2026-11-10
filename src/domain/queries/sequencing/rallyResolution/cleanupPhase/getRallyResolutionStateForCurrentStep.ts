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
  const rallyingPlayer = getRallyingPlayer(state);
  if (player !== rallyingPlayer) {
    throw new Error(
      `Expected ${rallyingPlayer} to resolve rally, got ${player}`,
    );
  }

  return getCurrentRallyResolutionState(state);
}
