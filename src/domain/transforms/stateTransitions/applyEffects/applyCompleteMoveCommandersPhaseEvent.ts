import type { Board, GameState, IssueCommandsPhaseState } from '@entities';
import type { CompleteMoveCommandersPhaseEvent } from '@events';
import { ISSUE_COMMANDS_PHASE } from '@entities';
import { getMoveCommandersPhaseState } from '@queries';
import {
  updateCompletedPhase,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a CompleteMoveCommandersPhaseEvent to the game state.
 * Marks moveCommanders phase as complete and advances to issueCommands phase.
 * Uses the commands from the event to populate remaining commands.
 *
 * @param event - The complete move commanders phase event to apply
 * @param state - The current game state
 * @returns A new game state with the phase advanced
 */
export function applyCompleteMoveCommandersPhaseEvent<TBoard extends Board>(
  event: CompleteMoveCommandersPhaseEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const currentPhaseState = getMoveCommandersPhaseState(state);

  if (currentPhaseState.step !== 'complete') {
    throw new Error('Move commanders phase is not on complete step');
  }

  // Add the completed phase to the set of completed phases
  const stateWithCompletedPhase = updateCompletedPhase(
    state,
    currentPhaseState,
  );

  // Create the new issue commands phase state using commands from the event
  const newPhaseState: IssueCommandsPhaseState<TBoard> = {
    phase: ISSUE_COMMANDS_PHASE,
    step: 'firstPlayerIssueCommands',
    remainingCommandsFirstPlayer: event.firstPlayerCommands,
    remainingUnitsFirstPlayer: new Set(),
    remainingCommandsSecondPlayer: event.secondPlayerCommands,
    remainingUnitsSecondPlayer: new Set(),
    currentCommandResolutionState: undefined,
  };

  return updatePhaseState(stateWithCompletedPhase, newPhaseState);
}
