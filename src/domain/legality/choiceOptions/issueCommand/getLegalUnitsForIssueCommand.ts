import type {
  Command,
  PlayerSide,
  Restrictions,
  UnitWithPlacement,
} from '@entities';
import type { GameState } from '@game';
import {
  getCommanderSpace,
  getPlayerUnitsWithPlacementOnBoard,
  getSpacesWithinDistance,
  hasUnitInArray,
  matchesUnitRequirements,
} from '@queries';

/**
 * Trait + unit-type id restrictions only (no inspiration range).
 */
export function unitMatchesTraitAndTypeRestrictions(
  unitWithPlacement: UnitWithPlacement,
  restrictions: Restrictions,
): boolean {
  return matchesUnitRequirements(
    unitWithPlacement.unit.unitType,
    restrictions.traitRestrictions,
    restrictions.unitRestrictions,
  ).result;
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
 * (inspiration + traits/types). Excludes already-commanded units.
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
