import type { ValidationResult } from '@utils';
import type { IssueCommandEvent, UnitsOrderSelection } from '@events';
import type { Command, PlayerSide, UnitInstance } from '@entities';
import type { GameState } from '@game';
import {
  findLegalLine,
  getLegalIssueCommands,
  getLegalLines,
  getLegalUnitsToOrder,
  getLineRefusalReason,
  getUnitsOrderRefusalReason,
  listsWholeLine,
} from '@legality';
import { findMatchingCommand, isSameUnitInstance } from '@queries';
import { findIllegal } from '@utils';

/**
 * A units order: each unit must have been enumerated after the units before
 * it, and the order must take at least one (§4.3.2).
 */
function isValidUnitsOrder(
  command: Command,
  player: PlayerSide,
  state: GameState,
  selection: UnitsOrderSelection,
): ValidationResult {
  const { units } = selection;
  const refused = findIllegal(
    units,
    (soFar) => getLegalUnitsToOrder(command, player, state, soFar),
    (a, b) => isSameUnitInstance(a, b),
  );
  if (refused === undefined) {
    const valid: ValidationResult = { result: true };
    return valid;
  }

  if (refused.refusal === 'notEnumerated') {
    const notEnumerated: ValidationResult = {
      errorReason: getUnitsOrderRefusalReason(command, units, refused.index),
      result: false,
    };
    return notEnumerated;
  }

  const empty: ValidationResult = {
    errorReason: `Expected 1..${command.number} units, got 0`,
    result: false,
  };
  return empty;
}

/**
 * Validates an IssueCommandEvent by membership against the legal options
 * `@legality` enumerates:
 * - {@link getLegalIssueCommands}: the player, and the orders still to give;
 *   with no order the player stops, which is always legal for them (§4.3.3)
 * - a units order: each unit as enumerated by {@link getLegalUnitsToOrder}
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

  // With no order the player stops, which is always legal while orders are
  // left (§4.3.3).
  const { order } = event;
  if (order === 'none') {
    const stopping: ValidationResult = { result: true };
    return stopping;
  }

  const matchingCommand = findMatchingCommand(
    [...legal.commands],
    order.command,
  );
  if (matchingCommand === undefined) {
    return {
      errorReason: `Command is not among remaining commands for ${event.player}`,
      result: false,
    };
  }

  // A units order names units, and a lines order names a line.
  const { selection } = order;
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
      errorReason: 'A lines order is given to a line, listed unit by unit',
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

  // A line holds at least one unit (§4.3.5).
  const { units } = selection;
  const first = units[0];
  const last = units.at(-1);
  if (first === undefined || last === undefined) {
    const empty: ValidationResult = {
      errorReason: 'A line order lists at least one unit',
      result: false,
    };
    return empty;
  }

  // The list's two ends must name one of the lines that may be ordered
  // (§4.3.5).
  const ends: [UnitInstance, UnitInstance] = [first, last];
  const lines = getLegalLines(matchingCommand, event.player, state);
  const line = findLegalLine(lines, ends);
  if (line === undefined) {
    const notALine: ValidationResult = {
      errorReason: getLineRefusalReason(
        matchingCommand,
        event.player,
        state,
        ends,
      ),
      result: false,
    };
    return notALine;
  }

  // Every unit of that line is ordered, so the list must hold them all, in
  // rank order from either end.
  if (!listsWholeLine(line, units)) {
    const notWhole: ValidationResult = {
      errorReason:
        'The units listed are not every unit of the line between its ends, in rank order',
      result: false,
    };
    return notWhole;
  }

  const valid: ValidationResult = { result: true };
  return valid;
}
