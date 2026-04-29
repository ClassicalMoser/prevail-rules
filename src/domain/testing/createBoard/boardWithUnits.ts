import type { StandardBoard, StandardBoardCoordinate, UnitFacing, UnitInstance } from "@entities";
import { addUnitToBoard, createEmptyStandardBoard } from "@transforms";

/**
 * Creates a board with units at specified positions.
 * Composes the pure transform addUnitToBoard for each placement.
 *
 * @param units - Array of unit placements, each specifying unit, coordinate, and facing
 * @returns A standard board with the specified units placed
 */
export function createBoardWithUnits(
  units: Array<{
    unit: UnitInstance;
    coordinate: StandardBoardCoordinate;
    facing: UnitFacing;
  }>,
): StandardBoard {
  let board = createEmptyStandardBoard();
  for (const { unit, coordinate, facing } of units) {
    board = addUnitToBoard(board, {
      boardType: "standard" as const,
      unit,
      placement: { boardType: "standard" as const, coordinate, facing },
    });
  }
  return board;
}
