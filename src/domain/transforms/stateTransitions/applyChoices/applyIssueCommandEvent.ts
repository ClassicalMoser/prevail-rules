import type { IssueCommandEvent } from '@events';
import type { GameState } from '@game';
import { getMatchingCommand, getRemainingCommandsForPlayer } from '@queries';
import {
  addUnitsToCommandedUnits,
  beginResolvingCommands,
  updateRemainingCommandsForPlayer,
} from '@transforms/pureTransforms';

/**
 * Applies an IssueCommandEvent to the game state.
 * Removes the command from remaining commands and adds the units it orders,
 * whether listed for a units order or a line, to commandedUnits.
 * When that player's remaining commands are exhausted on their issue step, they
 * move on to carrying their orders out.
 * With no order, the player stops: the orders left are forfeited and they
 * move on to carrying out the ones given (§4.3.3).
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
  const { player, order } = event;

  // With no order the player stops, and whatever is not issued is forfeited
  // (§4.3.3).
  if (order === null) {
    const stopped = beginResolvingCommands(state);
    return stopped;
  }

  // The order lists every unit it orders, a units order and a line alike
  // (§4.3.5).
  const { command, selection } = order;
  const { units } = selection;

  // The order is spent, whichever of the player's orders it matched.
  const remainingCommands = getRemainingCommandsForPlayer(state, player);
  const matchingCommand = getMatchingCommand(remainingCommands, command);
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
