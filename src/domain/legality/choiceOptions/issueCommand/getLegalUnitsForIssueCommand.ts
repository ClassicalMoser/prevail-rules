import type {
  Command,
  PlayerSide,
  Restrictions,
  UnitWithPlacement,
} from '@entities';
import type { GameState } from '@game';
import {
  getBoardSpace,
  getCommanderSpace,
  getPlayerUnitsWithPlacementOnBoard,
  getSpacesWithinDistance,
  hasEngagedUnits,
  hasUnitInArray,
  unitTypeMatchesRestrictions,
} from '@queries';

/**
 * Trait or unit-type filter only (no inspiration range).
 */
export function unitMatchesTraitAndTypeRestrictions(
  unitWithPlacement: UnitWithPlacement,
  restrictions: Restrictions,
): boolean {
  const unitType = unitWithPlacement.unit.unitType;
  const matches = unitTypeMatchesRestrictions(unitType, restrictions);
  return matches;
}

/**
 * Inspiration-range restriction only. `inspirationRangeRestriction < 0`
 * skips the check (always true).
 */
export function unitMatchesInspirationRange(
  unitWithPlacement: UnitWithPlacement,
  restrictions: Restrictions,
  gameState: GameState,
): boolean {
  const { inspirationRangeRestriction } = restrictions;
  if (inspirationRangeRestriction < 0) {
    return true;
  }
  const commanderSpace = getCommanderSpace(
    unitWithPlacement.unit.playerSide,
    gameState.boardState,
  );
  if (commanderSpace === undefined) {
    return false;
  }
  const spacesWithinDistance = getSpacesWithinDistance(
    gameState.boardState,
    commanderSpace,
    inspirationRangeRestriction,
  );
  return spacesWithinDistance.has(unitWithPlacement.placement.coordinate);
}

/**
 * Full command restrictions: inspiration range (if applicable) + traits/types.
 * Used for `size: 'units'` (every commanded unit) and for **line starts**.
 */
export function unitMatchesRestrictions(
  unitWithPlacement: UnitWithPlacement,
  restrictions: Restrictions,
  gameState: GameState,
): boolean {
  if (
    !unitMatchesInspirationRange(unitWithPlacement, restrictions, gameState)
  ) {
    return false;
  }
  return unitMatchesTraitAndTypeRestrictions(unitWithPlacement, restrictions);
}

/**
 * Whether the unit is free of an engagement: a unit locked with an enemy
 * cannot be ordered (§4.3.4), alone or as a line's start.
 */
function notEngaged(
  unitWithPlacement: UnitWithPlacement,
  gameState: GameState,
): boolean {
  const space = getBoardSpace(
    gameState.boardState,
    unitWithPlacement.placement.coordinate,
  );
  const free = !hasEngagedUnits(space.unitPresence);
  return free;
}

function notAlreadyCommanded(
  unitWithPlacement: UnitWithPlacement,
  gameState: GameState,
): boolean {
  return !hasUnitInArray(
    gameState.currentRoundState.commandedUnits,
    unitWithPlacement.unit,
  );
}

/**
 * Returns friendly on-board units eligible under full command restrictions
 * (inspiration + traits/types). Excludes already-commanded units, and engaged
 * ones (§4.3.4, A1).
 *
 * For `size: 'units'`: selection atoms.
 * For `size: 'lines'`: legal **line starts** (end may lie outside inspiration
 * range; see {@link getLegalLineEndsForIssueCommand}).
 */
export function getLegalUnitsForIssueCommand(
  command: Command,
  player: PlayerSide,
  gameState: GameState,
): UnitWithPlacement[] {
  const onBoard = getPlayerUnitsWithPlacementOnBoard(gameState, player);
  const result: UnitWithPlacement[] = [];

  for (const unitWithPlacement of onBoard) {
    if (!notAlreadyCommanded(unitWithPlacement, gameState)) {
      continue;
    }
    // An engaged unit cannot be ordered, alone or to begin a line.
    if (!notEngaged(unitWithPlacement, gameState)) {
      continue;
    }
    if (
      unitMatchesRestrictions(
        unitWithPlacement,
        command.restrictions,
        gameState,
      )
    ) {
      result.push(unitWithPlacement);
    }
  }

  return result;
}

/** Alias: line starts are the same atoms as fully restriction-eligible units. */
export const getLegalLineStartsForIssueCommand: typeof getLegalUnitsForIssueCommand =
  getLegalUnitsForIssueCommand;
