import type { Board, GameState, IssueCommandsPhaseState } from '@entities';
import type { CompleteMoveCommandersPhaseEvent } from '@events';
import { ISSUE_COMMANDS_PHASE } from '@entities';
import { getMoveCommandersPhaseState, getOtherPlayer } from '@queries';
import { updateCompletedPhase, updatePhaseState } from '@transforms/pureTransforms';

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
  event: CompleteMoveCommandersPhaseEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const currentPhaseState = getMoveCommandersPhaseState(state);

  if (currentPhaseState.step !== 'complete') {
    throw new Error('Move commanders phase is not on complete step');
  }

  // Add the completed phase to the set of completed phases
  const stateWithCompletedPhase = updateCompletedPhase(state, currentPhaseState);

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
  const newPhaseState: IssueCommandsPhaseState<TBoard> = {
    phase: ISSUE_COMMANDS_PHASE,
    step: 'firstPlayerIssueCommands',
    remainingCommandsFirstPlayer: firstPlayerCommands,
    remainingUnitsFirstPlayer: new Set(), // Will be populated as commands are issued
    remainingCommandsSecondPlayer: secondPlayerCommands,
    remainingUnitsSecondPlayer: new Set(), // Will be populated as commands are issued
    currentCommandResolutionState: undefined,
  };

  const stateWithPhase = updatePhaseState(stateWithCompletedPhase, newPhaseState);

  return stateWithPhase;
}
