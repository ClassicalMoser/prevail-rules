import type { Board, Command } from "@entities";
import type { IssueCommandEvent } from "@events";
import type { GameStateForBoard, IssueCommandsPhaseStateForBoard } from "@game";
import { findMatchingCommand, getIssueCommandsPhaseStateForBoard } from "@queries";
import {
  addUnitsToCommandedUnits,
  updatePhaseState,
  updateRemainingPlayerCommands,
} from "@transforms/pureTransforms";

/**
 * Applies an IssueCommandEvent to the game state.
 * Removes the command from remaining commands and adds the units to commandedUnits.
 * Event is assumed pre-validated (issueCommands phase, command in that player's remaining commands).
 *
 * @param event - The issue command event to apply
 * @param state - The current game state
 * @returns A new game state with the command issued
 */
export function applyIssueCommandEvent<TBoard extends Board>(
  event: IssueCommandEvent,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  const phaseState = getIssueCommandsPhaseStateForBoard(state);
  const player = event.player;
  const command = event.command;
  const units = event.units;

  // Determine if this is the first or second player
  const isFirstPlayer = player === state.currentInitiative;
  const remainingCommands = isFirstPlayer
    ? phaseState.remainingCommandsFirstPlayer
    : phaseState.remainingCommandsSecondPlayer;

  // Resolve set member to remove (pre-validated: command is in remaining commands)
  const matchingCommand = findMatchingCommand(remainingCommands, command)!;

  // Remove the matching command from remaining commands
  const newRemainingCommands: Set<Command> = new Set(
    [...remainingCommands].filter((c) => c !== matchingCommand),
  );

  // Update phase state with new remaining commands
  const newPhaseState: IssueCommandsPhaseStateForBoard<TBoard> = updateRemainingPlayerCommands(
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
