import type { UnitInstance, UnitWithPlacement } from '@entities';
import type { ValidationResult } from '@utils';
import type { IssueCommandEvent } from '@events';
import type { GameState } from '@game';
import {
  getLegalIssueCommands,
  getLegalLineEndsForIssueCommand,
  getLegalUnitsForIssueCommand,
} from '@legality';
import {
  findMatchingCommand,
  getLineSegmentContainingUnit,
  getPositionOfUnit,
  isSameUnitInstance,
} from '@queries';

function unitKey(unit: UnitInstance): string {
  return `${unit.playerSide}:${unit.unitType.id}:${unit.instanceNumber}`;
}

function toPlacements(
  units: readonly UnitInstance[],
  state: GameState,
): UnitWithPlacement[] {
  return units.map((unit) => ({
    placement: getPositionOfUnit(state.boardState, unit),
    unit,
  }));
}

function sameOrderedUnitKeys(
  a: readonly string[],
  b: readonly string[],
): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((key, index) => key === b[index]);
}

/**
 * Validates an IssueCommandEvent as an integral commit over atoms:
 * - {@link getLegalIssueCommands} (player + remaining commands)
 * - {@link getLegalUnitsForIssueCommand} (units / line **starts**)
 * - {@link getLegalLineEndsForIssueCommand} (ends for a chosen start)
 *
 * `size: 'units'`: `1..command.number` unique fully-restricted units
 * (`number` is a **cap**, not a hard quota).
 *
 * `size: 'lines'`: UI picks start then end (singleton start=end is a line).
 * Inspiration range applies to the **start** only; trait/type restrictions
 * apply along the segment. Remaining grants are seeded as `number: 1` slots
 * (lines ×N expanded when completing move-commanders); `event.units` must be
 * the contiguous start–end segment for that single line.
 */
export function isValidIssueCommandEvent(
  event: IssueCommandEvent,
  state: GameState,
): ValidationResult {
  const legal = getLegalIssueCommands(state);
  if (legal === null) {
    return {
      errorReason: 'Issue command is not expected in the current state',
      result: false,
    };
  }

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

  const uniqueKeys = new Set(event.units.map(unitKey));
  if (uniqueKeys.size !== event.units.length) {
    return {
      errorReason: 'Duplicate units in issue command selection',
      result: false,
    };
  }

  if (matchingCommand.size === 'units') {
    if (
      event.units.length === 0 ||
      event.units.length > matchingCommand.number
    ) {
      return {
        errorReason: `Expected 1..${matchingCommand.number} units, got ${event.units.length}`,
        result: false,
      };
    }
    const eligible = getLegalUnitsForIssueCommand(
      matchingCommand,
      event.player,
      state,
    );
    for (const unit of event.units) {
      const found = eligible.some(
        (candidate) => isSameUnitInstance(candidate.unit, unit).result,
      );
      if (!found) {
        return {
          errorReason:
            'Unit is not eligible for this command under its restrictions',
          result: false,
        };
      }
    }
    return { result: true };
  }

  // size === 'lines' — remaining slots should already be number: 1
  if (matchingCommand.number !== 1) {
    return {
      errorReason: `Line remaining command must be number 1 (got ${matchingCommand.number}); lines ×N should be expanded when seeding remaining commands`,
      result: false,
    };
  }

  if (event.units.length === 0) {
    return {
      errorReason: 'Line command requires at least one unit',
      result: false,
    };
  }

  const placements = toPlacements(event.units, state);
  const start = placements.at(0);
  const end = placements.at(-1);
  if (start === undefined || end === undefined) {
    return {
      errorReason: 'Line command requires at least one unit',
      result: false,
    };
  }

  // The end named second must be one the line may run to from the first
  // (§4.3.5); that also refuses a start that cannot begin a line.
  const legalEnds = getLegalLineEndsForIssueCommand(
    matchingCommand,
    event.player,
    state,
    start,
  );
  if (
    !legalEnds.some(
      (candidate) => isSameUnitInstance(candidate.unit, end.unit).result,
    )
  ) {
    return {
      errorReason: 'Line end is not reachable from the chosen start',
      result: false,
    };
  }

  // The units submitted must be exactly the rank between the two ends,
  // named in either direction.
  const rank = getLineSegmentContainingUnit(
    state.boardState,
    start,
    matchingCommand.restrictions,
    state.currentRoundState.commandedUnits,
  );
  const startIndex = rank.findIndex(
    (uwp) => isSameUnitInstance(uwp.unit, start.unit).result,
  );
  const endIndex = rank.findIndex(
    (uwp) => isSameUnitInstance(uwp.unit, end.unit).result,
  );
  const low = Math.min(startIndex, endIndex);
  const high = Math.max(startIndex, endIndex);
  const expectedKeys = rank
    .slice(low, high + 1)
    .map((uwp) => unitKey(uwp.unit));
  const eventKeys = event.units.map(unitKey);
  const matchesForward = sameOrderedUnitKeys(eventKeys, expectedKeys);
  const matchesReverse = sameOrderedUnitKeys(
    eventKeys,
    expectedKeys.toReversed(),
  );
  if (!matchesForward && !matchesReverse) {
    return {
      errorReason: 'Submitted units do not match the start–end line segment',
      result: false,
    };
  }

  return { result: true };
}
