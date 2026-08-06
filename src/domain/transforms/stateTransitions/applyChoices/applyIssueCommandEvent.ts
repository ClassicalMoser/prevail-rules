import type { IssueCommandEvent } from '@events';
import type { GameState, IssueCommandsPhaseState } from '@game';
import { findMatchingCommand, getIssueCommandsPhaseState } from '@queries';
import {
  addUnitsToCommandedUnits,
  updatePhaseState,
  updateRemainingPlayerCommands,
} from '@transforms/pureTransforms';

/**
 * Applies an IssueCommandEvent to the game state.
 * Removes the command from remaining commands and adds the units to commandedUnits.
 * Event is assumed pre-validated (issueCommands phase, command in that player's remaining commands).
 *
 * @param event - The issue command event to apply
 * @param state - The current game state
 * @returns A new game state with the command issued
 */
export function applyIssueCommandEvent<S extends GameState>(
  event: IssueCommandEvent,
  state: S,
): S {
  const phaseState = getIssueCommandsPhaseState(state);
  const { player } = event;
  const { command } = event;
  const { units } = event;

  // Determine if this is the first or second player
  const isFirstPlayer = player === state.currentInitiative;
  const remainingCommands = isFirstPlayer
    ? phaseState.remainingCommandsFirstPlayer
    : phaseState.remainingCommandsSecondPlayer;

  // Resolve set member to remove (pre-validated: command is in remaining commands)
  const matchingCommand = findMatchingCommand(remainingCommands, command);

  // Remove the matching command from remaining commands
  const newRemainingCommands = [...remainingCommands].filter(
    (c) => c !== matchingCommand,
  );

  // Update phase state with new remaining commands
  const newPhaseState: IssueCommandsPhaseState = updateRemainingPlayerCommands(
    phaseState,
    player,
    state.currentInitiative,
    newRemainingCommands,
  );

  const stateWithPhase = updatePhaseState(state, newPhaseState);

  // Add units to commandedUnits
  const newGameState = addUnitsToCommandedUnits(stateWithPhase, units);
  return newGameState;
}
