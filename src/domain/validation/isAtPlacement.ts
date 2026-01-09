import type { Board, UnitWithPlacement, ValidationResult } from '@entities';
import { areSameSide, getPlayerUnitWithPosition } from '@queries';

/**
 * Determines whether a unit is at a specific placement on the board.
 *
 * @param board - The board state
 * @param unitWithPlacement - The unit with its placement
 * @returns ValidationResult indicating if the unit is at the placement
 */
export function isAtPlacement<TBoard extends Board>(
  board: TBoard,
  unitWithPlacement: UnitWithPlacement<TBoard>,
): ValidationResult {
  try {
    // Get the declared coordinate of the unit on the board.
    const boardCoordinate = unitWithPlacement.placement.coordinate;
    const friendlySide = unitWithPlacement.unit.playerSide;

    // Get the friendly unit at the coordinate
    const friendlyUnitWithPlacement = getPlayerUnitWithPosition(
      board,
      boardCoordinate,
      friendlySide,
    );

    // If there's no friendly unit at the coordinate, the unit is not at the placement.
    if (!friendlyUnitWithPlacement) {
      return {
        result: false,
      };
    }

    // If the friendly unit is not facing the same direction as the declared facing, the unit is not at the placement.
    if (
      friendlyUnitWithPlacement.placement.facing !==
      unitWithPlacement.placement.facing
    ) {
      return {
        result: false,
      };
    }

    // If the friendly unit is not the same as the unit on the board, the unit is not at the placement.
    // Compare by value since UnitInstance is identified by playerSide, unitType, and instanceNumber.
    if (
      !areSameSide(friendlyUnitWithPlacement.unit, unitWithPlacement.unit) ||
      friendlyUnitWithPlacement.unit.unitType !==
        unitWithPlacement.unit.unitType ||
      friendlyUnitWithPlacement.unit.instanceNumber !==
        unitWithPlacement.unit.instanceNumber
    ) {
      return {
        result: false,
      };
    }

    // If all checks pass, the unit is at the placement.
    return {
      result: true,
    };
  } catch (error) {
    // Any error means the unit is not at the placement.
    return {
      result: false,
      errorReason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
