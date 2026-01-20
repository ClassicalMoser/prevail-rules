import type { Board, GameState, IssueCommandsPhaseState } from '@entities';
import type { CompleteMoveCommandersPhaseEvent } from '@events';
import { ISSUE_COMMANDS_PHASE } from '@entities';
import { getOtherPlayer } from '@queries';

/**
 * Applies a CompleteMoveCommandersPhaseEvent to the game state.
 * Marks moveCommanders phase as complete and advances to issueCommands phase.
 * Sets the remaining commands to the commands on the cards in play.
 *
 * @param event - The complete move commanders phase event to apply
 * @param state - The current game state
 * @returns A new game state with the phase advanced
 */
export function applyCompleteMoveCommandersPhaseEvent<TBoard extends Board>(
  event: CompleteMoveCommandersPhaseEvent,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const currentPhaseState = state.currentRoundState.currentPhaseState;
  
  if (!currentPhaseState) {
    throw new Error('No current phase state found');
  }
  
  if (currentPhaseState.phase !== 'moveCommanders') {
    throw new Error('Current phase is not moveCommanders');
  }
  
  if (currentPhaseState.step !== 'complete') {
    throw new Error('Move commanders phase is not on complete step');
  }

  // Add the completed phase to the set of completed phases
  const newCompletedPhases = new Set(state.currentRoundState.completedPhases);
  newCompletedPhases.add(currentPhaseState);

  // Determine first and second player based on initiative
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  // Get commands from the cards in play
  const firstPlayerCard = state.cardState[firstPlayer].inPlay;
  const secondPlayerCard = state.cardState[secondPlayer].inPlay;

  if (!firstPlayerCard || !secondPlayerCard) {
    throw new Error('First or second player card not found');
  }

  const firstPlayerCommands = new Set([firstPlayerCard.command]);
  const secondPlayerCommands = new Set([secondPlayerCard.command]);

  // Create the new issue commands phase state
  const newPhaseState: IssueCommandsPhaseState = {
    phase: ISSUE_COMMANDS_PHASE,
    step: 'firstPlayerIssueCommands',
    remainingCommandsFirstPlayer: firstPlayerCommands,
    remainingUnitsFirstPlayer: new Set(), // Will be populated as commands are issued
    remainingCommandsSecondPlayer: secondPlayerCommands,
    remainingUnitsSecondPlayer: new Set(), // Will be populated as commands are issued
  };

  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      completedPhases: newCompletedPhases,
      currentPhaseState: newPhaseState,
    },
  };
}
