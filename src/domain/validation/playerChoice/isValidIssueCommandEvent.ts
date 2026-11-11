import type { ValidationResult } from '@utils';
import type { IssueCommandEvent, UnitsOrderSelection } from '@events';
import type { Command, PlayerSide } from '@entities';
import type { GameState } from '@game';
import {
  findLegalLine,
  getLegalIssueCommands,
  getLegalLines,
  getLegalUnitsToOrder,
  getLineRefusalReason,
  getUnitsOrderRefusalReason,
} from '@legality';
import { findMatchingCommand, isSameUnitInstance } from '@queries';
import { findRefusal } from '@utils';

/**
 * A units order: each unit must have been offered after the units before
 * it, and the order must take at least one (§4.3.2).
 */
function isValidUnitsOrder(
  command: Command,
  player: PlayerSide,
  state: GameState,
  selection: UnitsOrderSelection,
): ValidationResult {
  const { units } = selection;
  const refused = findRefusal(
    units,
    (soFar) => getLegalUnitsToOrder(command, player, state, soFar),
    (a, b) => isSameUnitInstance(a, b),
  );
  if (refused === undefined) {
    const valid: ValidationResult = { result: true };
    return valid;
  }

  if (refused.refusal === 'notOffered') {
    const notOffered: ValidationResult = {
      errorReason: getUnitsOrderRefusalReason(command, units, refused.index),
      result: false,
    };
    return notOffered;
  }

  const empty: ValidationResult = {
    errorReason: `Expected 1..${command.number} units, got 0`,
    result: false,
  };
  return empty;
}

/**
 * Validates an IssueCommandEvent by membership against what `@legality`
 * offers:
 * - {@link getLegalIssueCommands}: the player, and the orders still to give
 * - a units order: each unit as offered by {@link getLegalUnitsToOrder}
 * - a line order: its two ends naming one of {@link getLegalLines}
 *
 * Remaining line grants are seeded as `number: 1` slots (lines ×N expanded
 * when completing move-commanders), so each line order names one line.
 */
export function isValidIssueCommandEvent(
  event: IssueCommandEvent,
  state: GameState,
): ValidationResult {
  const legal = getLegalIssueCommands(state);

  if (event.player !== legal.player) {
    return {
      errorReason: `Expected issue command from ${legal.player}, got ${event.player}`,
      result: false,
    };
  }

  const matchingCommand = findMatchingCommand(
    [...legal.commands],
    event.command,
  );
  if (matchingCommand === undefined) {
    return {
      errorReason: `Command is not among remaining commands for ${event.player}`,
      result: false,
    };
  }

  // A units order names units, and a lines order names a line.
  const { selection } = event;
  if (matchingCommand.size === 'units') {
    if (selection.selectionType !== 'units') {
      return {
        errorReason: 'A units order is given to units, not to a line',
        result: false,
      };
    }
    return isValidUnitsOrder(matchingCommand, event.player, state, selection);
  }

  if (selection.selectionType !== 'line') {
    return {
      errorReason: 'A lines order is given to a line, named by its two ends',
      result: false,
    };
  }

  // size === 'lines' — remaining slots should already be number: 1
  if (matchingCommand.number !== 1) {
    return {
      errorReason: `Line remaining command must be number 1 (got ${matchingCommand.number}); lines ×N should be expanded when seeding remaining commands`,
      result: false,
    };
  }

  // The two ends must name one of the lines that may be ordered (§4.3.5).
  const lines = getLegalLines(matchingCommand, event.player, state);
  if (findLegalLine(lines, selection.ends) === undefined) {
    return {
      errorReason: getLineRefusalReason(
        matchingCommand,
        event.player,
        state,
        selection.ends,
      ),
      result: false,
    };
  }

  const valid: ValidationResult = { result: true };
  return valid;
}
