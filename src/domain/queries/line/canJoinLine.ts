import type {
  Board,
  Coordinate,
  PlayerSide,
  UnitFacing,
  UnitType,
  UnitWithPlacement,
} from '@entities';
import { matchesUnitRequirements } from '@queries/unit';
import { getPlayerUnitWithPosition } from '@queries/unitPresence';
import type { Trait } from '@ruleValues';

/**
 * Whether the friendly unit at `coordinate` may join a line anchored on a unit
 * facing `unitFacing` (or its opposite), with optional trait and type filters.
 *
 * Empty space, an enemy, a wrong facing, or a missed requirement cannot join.
 *
 * @param board - The board state
 * @param coordinate - The space to check
 * @param friendlySide - The side that owns the line
 * @param unitFacing - Facing of the unit the line is built from
 * @param oppositeUnitFacing - Opposite of `unitFacing`
 * @param traitRequirements - Traits every joining unit must have
 * @param unitTypeRequirements - Unit types a joining unit must be one of
 * @returns The unit when it can join, otherwise `undefined`
 */
export function canJoinLine(
  board: Board,
  coordinate: Coordinate,
  friendlySide: PlayerSide,
  unitFacing: UnitFacing,
  oppositeUnitFacing: UnitFacing,
  traitRequirements: Trait[],
  unitTypeRequirements: UnitType[],
): UnitWithPlacement | undefined {
  const playerUnit = getPlayerUnitWithPosition(board, coordinate, friendlySide);
  // No friendly unit: empty space or enemy
  if (playerUnit === undefined) {
    return undefined;
  }

  // Facing must match the line facing or its opposite
  const playerFacing = playerUnit.placement.facing;
  if (playerFacing !== unitFacing && playerFacing !== oppositeUnitFacing) {
    return undefined;
  }

  // Traits and unit types must match when filters are set
  const unitType = playerUnit.unit.unitType;
  const unitTypeIds = unitTypeRequirements.map(
    (requiredType) => requiredType.id,
  );
  const { result: matchesRequirements } = matchesUnitRequirements(
    unitType,
    traitRequirements,
    unitTypeIds,
  );
  if (!matchesRequirements) {
    return undefined;
  }

  return playerUnit;
}
