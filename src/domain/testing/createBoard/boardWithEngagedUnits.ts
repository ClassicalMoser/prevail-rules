import type { StandardBoard, StandardBoardCoordinate, UnitFacing, UnitInstance } from '@entities';
import { createEmptyStandardBoard } from '@transforms';

/**
 * Creates a board with engaged units at a coordinate.
 * Test-only: there is no pure transform for "set space to engaged"; this mutates the board shape.
 *
 * @param primaryUnit - The primary unit in the engagement
 * @param secondaryUnit - The secondary unit in the engagement
 * @param coord - The coordinate where the engagement occurs (defaults to "E-5")
 * @param primaryFacing - The facing of the primary unit (defaults to "north")
 */
export function createBoardWithEngagedUnits(
  primaryUnit: UnitInstance,
  secondaryUnit: UnitInstance,
  coord: StandardBoardCoordinate = 'E-5',
  primaryFacing: UnitFacing = 'north',
): StandardBoard {
  const board = createEmptyStandardBoard();
  const space = board.board[coord];
  if (!space) {
    throw new Error(`Expected board space at ${coord}`);
  }
  board.board[coord] = {
    ...space,
    unitPresence: {
      presenceType: 'engaged',
      primaryFacing,
      primaryUnit,
      secondaryUnit,
    },
  };
  return board;
}
