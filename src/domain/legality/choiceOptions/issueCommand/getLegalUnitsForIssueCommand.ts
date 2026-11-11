import type {
  Command,
  PlayerSide,
  Restrictions,
  UnitWithPlacement,
} from '@entities';
import type { GameState } from '@game';
import {
  getBoardSpace,
  getPlayerUnitsWithPlacementOnBoard,
  unitMatchesInspirationRange,
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
 * Full command restrictions: inspiration range (if applicable) + traits/types.
 * Used for `size: 'units'` (every commanded unit) and for the unit a line
 * must hold within range.
 */
export function unitMatchesRestrictions(
  unitWithPlacement: UnitWithPlacement,
  restrictions: Restrictions,
  gameState: GameState,
): boolean {
  if (
    !unitMatchesInspirationRange(
      unitWithPlacement.unit,
      restrictions,
      gameState,
    )
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
 * ones (§4.3.4).
 *
 * For `size: 'units'`: the units that may be chosen (see
 * {@link getLegalUnitsToOrder}).
 * For `size: 'lines'`: the units a line may be traced from, since every line
 * needs one unit within inspiration range (see {@link getLegalLines}).
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
    // An engaged unit cannot be ordered, alone or in a line.
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
