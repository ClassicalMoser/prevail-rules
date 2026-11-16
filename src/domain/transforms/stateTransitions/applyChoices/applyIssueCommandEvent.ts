import type { IssueCommandEvent } from '@events';
import type { GameState } from '@game';
import { getMatchingCommand, getRemainingCommandsForPlayer } from '@queries';
import {
  addUnitsToCommandedUnits,
  updateRemainingCommandsForPlayer,
} from '@transforms/pureTransforms';

/**
 * Applies an IssueCommandEvent to the game state.
 * Removes the command from remaining commands and adds the units it orders,
 * whether listed for a units order or a line, to commandedUnits.
 * With no order, the player stops, and the orders left are forfeited
 * (§4.3.3). Once no order is left, the expected engine asks for
 * completeIssuingCommands, which moves the player on to carrying them out.
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
    const stopped = updateRemainingCommandsForPlayer(state, player, []);
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
  return spent;
}
