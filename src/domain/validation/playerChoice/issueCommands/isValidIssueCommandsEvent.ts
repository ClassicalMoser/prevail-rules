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

// TODO(composition): this is `listsWholeLine` in @legality
// (`getLegalLines.ts`) again. Compared on every input: both refuse a list of
// another length, then match unit for unit with `isSameUnitInstance` in rank
// order or reversed; neither throws, and no sentinel reaches either. It cannot
// call that one, because `findIllegal` compares two parts of one type and
// `listsWholeLine` takes a `LegalLine`, placements and all, while a player
// names units alone. Settled by `listsWholeLine` taking the line's units, and
// this function going.
/** Whether two lists name the same line, unit by unit, read either way. */
function isSameLine(
  offered: readonly UnitInstance[],
  submitted: readonly UnitInstance[],
): boolean {
  // An order to a line commands every unit of it (§4.3.5), so the list must
  // hold exactly the line's units: none skipped between the ends, none added
  // beyond them. A list of another length is not the line.
  const matches = (ordered: readonly UnitInstance[]): boolean =>
    ordered.length === submitted.length &&
    ordered.every((unit, index) => {
      // The lengths already match, so `listed` is always there; the check
      // only satisfies the type.
      const listed = submitted[index];
      return listed !== undefined && isSameUnitInstance(unit, listed);
    });

  // A line is named from either end (§4.3.5), so its units may be listed in
  // rank order or from the other end.
  const same = matches(offered) || matches(offered.toReversed());

  // True when the player listed the offered line, read one way or the other.
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
  // Each unit must be one the order could still take after the units named
  // before it: eligible under the card's restrictions, not yet ordered this
  // round, named once, and within the printed number (§4.3.2, §4.3.4,
  // §4.3.6). A unit is named by who it is, so units match by identity.
  const { units } = allocation;
  const refused = findIllegal(
    units,
    (soFar) => getLegalUnitsToOrder(command, player, state, soFar),
    (a, b) => isSameUnitInstance(a, b),
  );

  // Every unit was offered in turn: the order stands as named.
  if (refused === undefined) {
    const valid: ValidationResult = { result: true };
    return valid;
  }

  // The player may always stop, so only a unit not offered is refused.
  // TODO(composition): this throw cannot be reached, so no spec has a case
  // for it: getLegalUnitsToOrder answers `mayStop: true` at every point, and
  // nothing a spec passes in can change that. Settled by an offer type whose
  // `mayStop` is the literal `true` for a choice that may always stop, so the
  // refusal type has no `mayNotStop` left to rule out.
  if (refused.refusal !== 'notEnumerated') {
    throw new Error('A units order may stop at any point');
  }

  // @legality words why that unit was not offered: named twice, one too
  // many, or not eligible for this order.
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
  // Each line must be one the order could still take after the lines named
  // before it: a legal line (§4.3.5), clear of every unit an earlier line
  // orders (§4.3.6), and within the printed number of lines (§4.3.3).
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

  // Every line was offered in turn: the order stands as named.
  if (refused === undefined) {
    const valid: ValidationResult = { result: true };
    return valid;
  }

  // The player may always stop, so only a line not offered is refused.
  // TODO(composition): unreachable, as in isValidUnitsAllocation:
  // getLegalLinesToOrder answers `mayStop: true` at every point. Settled the
  // same way.
  if (refused.refusal !== 'notEnumerated') {
    throw new Error('A lines order may stop at any point');
  }

  // @legality words why that line was not offered: one line too many, an
  // empty list, a unit already ordered, ends that name no legal line, or a
  // list that is not every unit between its ends.
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
  // Who is issuing now, and the command on their card in play (§4.3.1).
  // Asked off an issuing step, the enumerator throws: the expected check
  // refuses such an event first.
  const { command, player } = getLegalIssueCommands(state);

  // Each player issues their own orders on their own step (§4.3), so only the
  // player whose step it is may give them.
  if (event.player !== player) {
    const notIssuing: ValidationResult = {
      errorReason: `Expected issue commands from ${player}, got ${event.player}`,
      result: false,
    };
    return notIssuing;
  }

  // A units command is spent on units, and a lines command on lines.
  const { allocation } = event;
  if (allocation.allocationType !== command.size) {
    const wrongSize: ValidationResult = {
      errorReason: `The card in play gives a ${command.size} command, not ${allocation.allocationType}`,
      result: false,
    };
    return wrongSize;
  }

  // A units order names its units one by one (§4.3.2).
  if (allocation.allocationType === 'units') {
    const unitsVerdict = isValidUnitsAllocation(
      command,
      player,
      state,
      allocation,
    );
    return unitsVerdict;
  }

  // A lines order names each line, unit by unit (§4.3.3).
  const linesVerdict = isValidLinesAllocation(
    command,
    player,
    state,
    allocation,
  );
  return linesVerdict;
}
