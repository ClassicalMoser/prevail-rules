import type { GameState, RallyResolutionState } from '@game';
import { throwIfPending } from '@utils';
import { getCleanupPhaseState } from '../phases/getCleanupPhaseState';

/**
 * Gets the rally resolution state from cleanup phase for a specific player.
 * Assumes we're in cleanup phase with a rally resolution state (validation should happen elsewhere).
 *
 * @param state - The game state
 * @param player - The player ('white' or 'black')
 * @returns The rally resolution state for the player
 * @throws Error if not in cleanup phase or rally resolution state is missing
 */
export function getRallyResolutionState(
  state: GameState,
  player: 'white' | 'black',
): RallyResolutionState {
  const phaseState = getCleanupPhaseState(state);
  const firstPlayer = state.currentInitiative;
  const isFirstPlayer = player === firstPlayer;

  const rallyState = isFirstPlayer
    ? phaseState.firstPlayerRallyResolutionState
    : phaseState.secondPlayerRallyResolutionState;

  return throwIfPending(
    rallyState,
    `No ${player} rally resolution state found`,
  );
}
