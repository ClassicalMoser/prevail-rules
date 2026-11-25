import type { IssueCommandsEvent } from '@events';
import type { GameState } from '@game';
import { getUnitWithPlacementOnBoard } from '@queries';
import {
  addUnitsToCommandedUnits,
  beginResolvingCommands,
} from '@transforms/pureTransforms';

/**
 * Applies an IssueCommandsEvent: every unit the allocation orders, in a units
 * order or in any of its lines, is ordered for the round (§4.3.6), and the
 * player moves on to carrying those orders out. Whatever the allocation left
 * unissued is forfeited (§4.3.3).
 *
 * The event is assumed validated: the player's issuing step, and an
 * allocation the card in play allows.
 *
 * @param event - The issue commands event to apply
 * @param state - The current game state
 * @returns A new game state on the player's resolve step
 */
export function applyIssueCommandsEvent<S extends GameState>(
  event: IssueCommandsEvent,
  state: S,
): S {
  // Every unit ordered, whether named in a units order or in a line.
  const { allocation } = event;
  const named =
    allocation.allocationType === 'units'
      ? allocation.units
      : allocation.lines.flat();

  // The order names each unit by who it is; its stats are the board's, so
  // the unit ordered is the one standing there.
  const units = named.map(
    (unit) => getUnitWithPlacementOnBoard(state, unit).unit,
  );

  // They are ordered for the round, and none can be ordered again this round
  // (§4.3.6); a command's modifiers reach only these units (§4.3.8).
  const ordered = addUnitsToCommandedUnits(state, units);

  // The player issues every order before carrying any out (§4.3), so they move
  // straight on to resolving them, one unit at a time (§4.3.9).
  const resolving = beginResolvingCommands(ordered);

  // The player's resolve step, with the units they ordered left to act.
  return resolving;
}
