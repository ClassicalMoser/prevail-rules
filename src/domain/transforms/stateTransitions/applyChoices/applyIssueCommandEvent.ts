import type { Board, Command, GameState, IssueCommandsPhaseState } from '@entities';
import type { IssueCommandEvent } from '@events';
import { findMatchingCommand, getIssueCommandsPhaseState } from '@queries';
import { updatePhaseState } from '@transforms/pureTransforms';

/**
 * Applies an IssueCommandEvent to the game state.
 * Removes the command from remaining commands and adds the units to commandedUnits.
 *
 * @param event - The issue command event to apply
 * @param state - The current game state
 * @returns A new game state with the command issued
 */
export function applyIssueCommandEvent<TBoard extends Board>(
  event: IssueCommandEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const phaseState = getIssueCommandsPhaseState(state);
  const player = event.player;
  const command = event.command;
  const units = event.units;

  // Determine if this is the first or second player
  const isFirstPlayer = player === state.currentInitiative;
  const remainingCommands = isFirstPlayer
    ? phaseState.remainingCommandsFirstPlayer
    : phaseState.remainingCommandsSecondPlayer;

  // Find matching command
  const matchingCommand = findMatchingCommand(remainingCommands, command);

  if (!matchingCommand) {
    throw new Error('Command not found in remaining commands');
  }

  // Remove the matching command from remaining commands
  const newRemainingCommands: Set<Command> = new Set(
    Array.from(remainingCommands).filter((c) => c !== matchingCommand),
  );

  // Update phase state with new remaining commands
  const newPhaseState: IssueCommandsPhaseState<TBoard> = {
    ...phaseState,
    ...(isFirstPlayer
      ? {
          remainingCommandsFirstPlayer: newRemainingCommands,
        }
      : {
          remainingCommandsSecondPlayer: newRemainingCommands,
        }),
  };

  // Add units to commandedUnits
  const newCommandedUnits = new Set([
    ...Array.from(state.currentRoundState.commandedUnits),
    ...Array.from(units),
  ]);

  const stateWithPhase = updatePhaseState(state, newPhaseState);

  return {
    ...stateWithPhase,
    currentRoundState: {
      ...stateWithPhase.currentRoundState,
      commandedUnits: newCommandedUnits,
    },
  };
}
