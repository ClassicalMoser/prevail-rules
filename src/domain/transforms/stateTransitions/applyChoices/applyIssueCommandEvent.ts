import type { IssueCommandEvent } from '@events';
import type { GameState } from '@game';
import {
  findMatchingCommand,
  getLineBetweenEnds,
  getRemainingCommandsForPlayer,
} from '@queries';
import {
  addUnitsToCommandedUnits,
  beginResolvingCommands,
  updateRemainingCommandsForPlayer,
} from '@transforms/pureTransforms';

/**
 * Applies an IssueCommandEvent to the game state.
 * Removes the command from remaining commands and adds the units it orders,
 * or the line between its two ends, to commandedUnits.
 * When that player's remaining commands are exhausted on their issue step, they
 * move on to carrying their orders out.
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
  const { player } = event;
  const { command, selection } = event;

  // A units order names its units. A line order names only its ends, and
  // the board says who stands between them (§4.3.5).
  const units =
    selection.selectionType === 'units'
      ? selection.units
      : getLineBetweenEnds(
          state.boardState,
          selection.ends,
          command.restrictions,
          state.currentRoundState.commandedUnits,
        ).map((member) => member.unit);

  // The order is spent, whichever of the player's orders it matched.
  const remainingCommands = getRemainingCommandsForPlayer(state, player);
  const matchingCommand = findMatchingCommand(remainingCommands, command);
  if (matchingCommand === undefined) {
    throw new Error(
      'applyIssueCommandEvent: command not found in remaining commands',
    );
  }
  const commandsLeft = remainingCommands.filter((c) => c !== matchingCommand);

  // The units it orders are ordered for the round (§4.3.6).
  const ordered = addUnitsToCommandedUnits(state, units);
  const spent = updateRemainingCommandsForPlayer(ordered, player, commandsLeft);

  // With every order given, the player carries them out.
  if (commandsLeft.length > 0) {
    return spent;
  }
  const resolving = beginResolvingCommands(spent);
  return resolving;
}
