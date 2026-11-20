import type { ValidationResult } from '@utils';
import type { IssueCommandsEvent } from '@events';
import type {
  Command,
  LinesAllocation,
  PlayerSide,
  UnitInstance,
  UnitsAllocation,
} from '@entities';
import type { GameState } from '@game';
import {
  getLegalIssueCommands,
  getLegalLinesToOrder,
  getLegalUnitsToOrder,
  getLinesOrderRefusalReason,
  getUnitsOrderRefusalReason,
} from '@legality';
import { isSameUnitInstance } from '@queries';
import { findIllegal } from '@utils';

/** Whether two lists name the same line, unit by unit, read either way. */
function isSameLine(
  offered: readonly UnitInstance[],
  submitted: readonly UnitInstance[],
): boolean {
  const matches = (ordered: readonly UnitInstance[]): boolean =>
    ordered.length === submitted.length &&
    ordered.every((unit, index) => {
      const listed = submitted[index];
      return listed !== undefined && isSameUnitInstance(unit, listed);
    });
  const same = matches(offered) || matches(offered.toReversed());
  return same;
}

/**
 * A units order: each unit must have been offered after the units before it
 * (§4.3.2). Naming none declines the order.
 */
function isValidUnitsAllocation(
  command: Command,
  player: PlayerSide,
  state: GameState,
  allocation: UnitsAllocation,
): ValidationResult {
  const { units } = allocation;
  const refused = findIllegal(
    units,
    (soFar) => getLegalUnitsToOrder(command, player, state, soFar),
    (a, b) => isSameUnitInstance(a, b),
  );
  if (refused === undefined) {
    const valid: ValidationResult = { result: true };
    return valid;
  }

  // The player may always stop, so only a unit not offered is refused.
  if (refused.refusal !== 'notEnumerated') {
    throw new Error('A units order may stop at any point');
  }
  const notOffered: ValidationResult = {
    errorReason: getUnitsOrderRefusalReason(command, units, refused.index),
    result: false,
  };
  return notOffered;
}

/**
 * A lines order: each line must have been offered after the lines before it,
 * listed unit by unit in rank order from either end (§4.3.3, §4.3.5). Naming
 * none orders nobody.
 */
function isValidLinesAllocation(
  command: Command,
  player: PlayerSide,
  state: GameState,
  allocation: LinesAllocation,
): ValidationResult {
  const { lines } = allocation;
  const refused = findIllegal<readonly UnitInstance[]>(
    lines,
    (soFar) => {
      // The offer names each line's units with where they stand; the
      // player names the units alone.
      const offer = getLegalLinesToOrder(command, player, state, soFar);
      const next = offer.next.map((line) =>
        line.units.map((member) => member.unit),
      );
      return { mayStop: offer.mayStop, next };
    },
    isSameLine,
  );
  if (refused === undefined) {
    const valid: ValidationResult = { result: true };
    return valid;
  }

  // The player may always stop, so only a line not offered is refused.
  if (refused.refusal !== 'notEnumerated') {
    throw new Error('A lines order may stop at any point');
  }
  const notOffered: ValidationResult = {
    errorReason: getLinesOrderRefusalReason(
      command,
      player,
      state,
      lines,
      refused.index,
    ),
    result: false,
  };
  return notOffered;
}

/**
 * Validates an IssueCommandsEvent by membership against the legal options
 * `@legality` offers a part at a time:
 * - {@link getLegalIssueCommands}: the player, and the command on their card
 *   in play
 * - a units order: each unit as offered by {@link getLegalUnitsToOrder}
 * - a lines order: each line as offered by {@link getLegalLinesToOrder}
 *
 * The allocation must be of the kind the command's size names (§4.3.1).
 *
 * @param event - The issue commands event to validate
 * @param state - The current game state
 * @returns Whether the allocation is legal, and why not if it is not
 */
export function isValidIssueCommandsEvent(
  event: IssueCommandsEvent,
  state: GameState,
): ValidationResult {
  const { command, player } = getLegalIssueCommands(state);

  if (event.player !== player) {
    return {
      errorReason: `Expected issue commands from ${player}, got ${event.player}`,
      result: false,
    };
  }

  // A units command is spent on units, and a lines command on lines.
  const { allocation } = event;
  if (allocation.allocationType !== command.size) {
    return {
      errorReason: `The card in play gives a ${command.size} command, not ${allocation.allocationType}`,
      result: false,
    };
  }

  if (allocation.allocationType === 'units') {
    return isValidUnitsAllocation(command, player, state, allocation);
  }
  return isValidLinesAllocation(command, player, state, allocation);
}
