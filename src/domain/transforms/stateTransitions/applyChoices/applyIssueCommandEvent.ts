import type { Board, GameState, IssueCommandsPhaseState } from '@entities';
import type { IssueCommandEvent } from '@events';
import { getIssueCommandsPhaseState } from '@queries';

/**
 * Applies an IssueCommandEvent to the game state.
 * Adds the units to the appropriate remainingUnits set and removes the command
 * from the remainingCommands set. Advances the step if all commands are issued.
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
  const isIssueStep =
    phaseState.step === 'firstPlayerIssueCommands' ||
    phaseState.step === 'secondPlayerIssueCommands';

  if (!isIssueStep) {
    throw new Error(`Wrong step for issuing commands: ${phaseState.step}`);
  }

  // Validate step matches player
  if (
    (isFirstPlayer && phaseState.step !== 'firstPlayerIssueCommands') ||
    (!isFirstPlayer && phaseState.step !== 'secondPlayerIssueCommands')
  ) {
    throw new Error(`Wrong player for step ${phaseState.step}`);
  }

  // Get the appropriate remaining commands and units sets
  const remainingCommands = isFirstPlayer
    ? phaseState.remainingCommandsFirstPlayer
    : phaseState.remainingCommandsSecondPlayer;
  const remainingUnits = isFirstPlayer
    ? phaseState.remainingUnitsFirstPlayer
    : phaseState.remainingUnitsSecondPlayer;

  // Validate command exists in remaining commands
  // Find matching command by comparing all properties
  const matchingCommand = Array.from(remainingCommands).find(
    (c) =>
      c.type === command.type &&
      c.size === command.size &&
      c.number === command.number &&
      JSON.stringify(c.restrictions) === JSON.stringify(command.restrictions) &&
      JSON.stringify(c.modifiers) === JSON.stringify(command.modifiers),
  );

  if (!matchingCommand) {
    throw new Error('Command not found in remaining commands');
  }

  // Remove the matching command from remaining commands
  const newRemainingCommands = new Set(
    Array.from(remainingCommands).filter((c) => c !== matchingCommand),
  );

  // Add units to remaining units
  const newRemainingUnits = new Set([
    ...Array.from(remainingUnits),
    ...Array.from(units),
  ]);

  // Check if all commands are issued (remainingCommands is empty)
  const allCommandsIssued = newRemainingCommands.size === 0;

  // Determine next step
  let nextStep: typeof phaseState.step;
  if (isFirstPlayer) {
    nextStep = allCommandsIssued
      ? 'firstPlayerResolveCommands'
      : 'firstPlayerIssueCommands';
  } else {
    nextStep = allCommandsIssued
      ? 'secondPlayerResolveCommands'
      : 'secondPlayerIssueCommands';
  }

  // Update phase state
  const newPhaseState: IssueCommandsPhaseState<TBoard> = {
    ...phaseState,
    step: nextStep,
    ...(isFirstPlayer
      ? {
          remainingCommandsFirstPlayer: newRemainingCommands,
          remainingUnitsFirstPlayer: newRemainingUnits,
        }
      : {
          remainingCommandsSecondPlayer: newRemainingCommands,
          remainingUnitsSecondPlayer: newRemainingUnits,
        }),
  };

  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: newPhaseState,
    },
  };
}
