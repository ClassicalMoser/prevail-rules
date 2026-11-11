import type { Board, UnitWithPlacement } from '@entities';
import type { ValidationResult } from '@utils';
import { findPlayerUnitWithPosition } from './findPlayerUnitWithPosition';
import { isSameUnitInstance } from '../unit/unitEquivalence';

/**
 * Determines whether a unit is at a specific placement on the board.
 *
 * @param board - The board state
 * @param unitWithPlacement - The unit with its placement
 * @returns ValidationResult indicating if the unit is at the placement
 * @throws Error when the placement names a coordinate that is not on the board
 */
export function isAtPlacement(
  board: Board,
  unitWithPlacement: UnitWithPlacement,
): ValidationResult {
  // Get the declared coordinate of the unit on the board.
  const boardCoordinate = unitWithPlacement.placement.coordinate;
  const friendlySide = unitWithPlacement.unit.playerSide;

  // Get the friendly unit at the coordinate
  const friendlyUnitWithPlacement = findPlayerUnitWithPosition(
    board,
    boardCoordinate,
    friendlySide,
  );

  // If there's no friendly unit at the coordinate, the unit is not at the placement.
  if (!friendlyUnitWithPlacement) {
    return {
      errorReason: 'No friendly unit at coordinate',
      result: false,
    };
  }

  // If the friendly unit is not facing the same direction as the declared facing, the unit is not at the placement.
  if (
    friendlyUnitWithPlacement.placement.facing !==
    unitWithPlacement.placement.facing
  ) {
    return {
      errorReason: 'Declared facing does not match facing of unit present',
      result: false,
    };
  }

  // If the friendly unit is not the same as the unit on the board, the unit is not at the placement.
  // Compare by value since UnitInstance is identified by playerSide, unitType, and instanceNumber.
  const { result: isSameUnit } = isSameUnitInstance(
    friendlyUnitWithPlacement.unit,
    unitWithPlacement.unit,
  );
  if (!isSameUnit) {
    return {
      errorReason: 'Unit is not at the placement',
      result: false,
    };
  }

  // If all checks pass, the unit is at the placement.
  return {
    result: true,
  };
}
