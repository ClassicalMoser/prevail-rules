import type { Board, GameState, IssueCommandsPhaseState } from '@entities';
import type { CompleteRangedAttackCommandEvent } from '@events';
import { getIssueCommandsPhaseState } from '@queries';

/**
 * Applies a CompleteRangedAttackCommandEvent to the game state.
 * Marks the ranged attack resolution state as completed and clears it
 * from currentCommandResolutionState, allowing command resolution to advance
 * to the next command or complete.
 *
 * @param event - The complete ranged attack command event to apply
 * @param state - The current game state
 * @returns A new game state with the ranged attack resolution state cleared
 */
export function applyCompleteRangedAttackCommandEvent<TBoard extends Board>(
  event: CompleteRangedAttackCommandEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getIssueCommandsPhaseState(state);

  // Clear from currentCommandResolutionState to allow advancing to next command
  const newPhaseState: IssueCommandsPhaseState<TBoard> = {
    ...phaseState,
    currentCommandResolutionState: undefined,
  };

  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: newPhaseState,
    },
  };
}
