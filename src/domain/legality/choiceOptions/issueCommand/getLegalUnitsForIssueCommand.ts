import type {
  Command,
  PlayerSide,
  Restrictions,
  UnitWithPlacement,
} from '@entities';
import type { GameState } from '@game';
import {
  canBeOrdered,
  getPlayerUnitsWithPlacementOnBoard,
  unitMatchesInspirationRange,
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

  const { commandedUnits } = gameState.currentRoundState;

  for (const unitWithPlacement of onBoard) {
    // Free of an engagement, not yet commanded, and allowed by the order's
    // traits and types (§4.3.4, §4.3.6).
    if (
      !canBeOrdered(
        unitWithPlacement,
        gameState.boardState,
        command.restrictions,
        commandedUnits,
      )
    ) {
      continue;
    }
    // Within inspiration range, where the order needs it.
    if (
      unitMatchesInspirationRange(
        unitWithPlacement.unit,
        command.restrictions,
        gameState,
      )
    ) {
      result.push(unitWithPlacement);
    }
  }

  return result;
}
