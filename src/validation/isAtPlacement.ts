import type { Board, UnitWithPlacement } from "@entities";
import { getPlayerUnitWithPosition } from "@functions/boardSpace";
import { areSameSide } from "@functions/unit";

/**
 * Determines whether a unit is at a specific placement on the board.
 *
 * @param board - The board state
 * @param unitWithPlacement - The unit with its placement
 * @returns True if the unit is at the placement, false otherwise
 */
export function isAtPlacement<TBoard extends Board>(
  board: TBoard,
  unitWithPlacement: UnitWithPlacement<TBoard>,
): boolean {
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
      return false;
    }

    // If the friendly unit is not facing the same direction as the declared facing, the unit is not at the placement.
    if (
      friendlyUnitWithPlacement.placement.facing !==
      unitWithPlacement.placement.facing
    ) {
      return false;
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
      return false;
    }

    // If all checks pass, the unit is at the placement.
    return true;
  } catch {
    // Any error means the unit is not at the placement.
    return false;
  }
}
