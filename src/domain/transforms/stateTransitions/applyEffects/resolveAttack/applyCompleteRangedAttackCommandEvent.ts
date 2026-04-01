import type { Board } from '@entities';
import type { CompleteRangedAttackCommandEvent } from '@events';
import type { GameState, IssueCommandsPhaseState } from '@game';
import { getIssueCommandsPhaseState } from '@queries';
import { updatePhaseState } from '@transforms/pureTransforms';

/**
 * Applies a CompleteRangedAttackCommandEvent to the game state.
 * Marks the ranged attack resolution state as completed and clears it
 * from currentCommandResolutionState, allowing command resolution to advance
 * to the next command or complete.
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields.
 * @param state - The current game state
 * @returns A new game state with the ranged attack resolution state cleared
 */
export function applyCompleteRangedAttackCommandEvent<TBoard extends Board>(
  _event: CompleteRangedAttackCommandEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getIssueCommandsPhaseState(state);

  // Clear from currentCommandResolutionState to allow advancing to next command
  const newPhaseState: IssueCommandsPhaseState = {
    ...phaseState,
    currentCommandResolutionState: undefined,
  };

  return updatePhaseState(state, newPhaseState);
}
