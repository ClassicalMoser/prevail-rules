import type { Board, GameState, RallyResolutionState } from '@entities';
import { getOtherPlayer } from '@queries/getOtherPlayer';
import { getCleanupPhaseState } from '../getPhaseState';
import { getCurrentRallyResolutionState } from '../getSubstep';

/**
 * Gets the rally resolution state for the current cleanup phase step.
 * Validates that we're in a resolveRally step and that the player matches the expected player for that step.
 *
 * @param state - The game state
 * @param player - The player attempting to access the rally state
 * @returns The rally resolution state for the current step
 * @throws Error if not in a resolveRally step, player doesn't match, or rally state is missing
 */
export function getRallyResolutionStateForCurrentStep<TBoard extends Board>(
  state: GameState<TBoard>,
  player: 'white' | 'black',
): RallyResolutionState {
  const phaseState = getCleanupPhaseState(state);
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  if (phaseState.step === 'firstPlayerResolveRally') {
    if (player !== firstPlayer) {
      throw new Error(
        `Expected ${firstPlayer} (first player) to resolve rally, got ${player}`,
      );
    }
  } else if (phaseState.step === 'secondPlayerResolveRally') {
    if (player !== secondPlayer) {
      throw new Error(
        `Expected ${secondPlayer} (second player) to resolve rally, got ${player}`,
      );
    }
  } else {
    throw new Error(
      `Cleanup phase is not on a resolveRally step: ${phaseState.step}`,
    );
  }

  return getCurrentRallyResolutionState(state);
}
