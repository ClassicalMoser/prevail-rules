import type { IssueCommandsEvent } from '@events';
import type { GameState } from '@game';
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
  const units =
    allocation.allocationType === 'units'
      ? allocation.units
      : allocation.lines.flat();

  // They are ordered for the round, and carried out next.
  const ordered = addUnitsToCommandedUnits(state, units);
  const resolving = beginResolvingCommands(ordered);
  return resolving;
}
