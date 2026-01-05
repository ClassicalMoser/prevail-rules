import type { Board, BoardCoordinate, PlayerSide } from '@entities';
import {
  getBoardSpace,
  getDiagonallyAdjacentSpaces,
  getOrthogonallyAdjacentSpaces,
} from '@queries';
import { hasEnemyUnit } from './unitPresence';

export function enemyBlocksDiagonal<TBoard extends Board>(
  playerSide: PlayerSide,
  board: TBoard,
  originCoordinate: BoardCoordinate<TBoard>,
  targetCoordinate: BoardCoordinate<TBoard>,
): boolean {
  try {
    // Check if the origin space is a diagonal space
    const originDiagonalSpaces = getDiagonallyAdjacentSpaces(
      board,
      originCoordinate,
    );
    if (!originDiagonalSpaces.has(targetCoordinate)) {
      // Target space is not a diagonal space - check is irrelevant
      return false;
    }

    // Find the shared orthogonal spaces between the origin and target spaces
    const originOrthogonalSpaces = getOrthogonallyAdjacentSpaces(
      board,
      originCoordinate,
    );
    const targetOrthogonalSpaces = getOrthogonallyAdjacentSpaces(
      board,
      targetCoordinate,
    );
    // Find intersection: spaces that are in both sets
    const sharedOrthogonalSpaces = new Set(
      Array.from(originOrthogonalSpaces).filter((space) =>
        targetOrthogonalSpaces.has(space),
      ),
    );

    // Check if the spaces are diagonally adjacent
    // Diagonally adjacent spaces share exactly 2 orthogonal spaces
    if (sharedOrthogonalSpaces.size !== 2) {
      // Spaces are not diagonally adjacent - check is irrelevant
      return false;
    }

    // Get the enemy spaces
    const enemySpaces = Array.from(sharedOrthogonalSpaces).filter((space) =>
      // Check if the space has an enemy unit
      hasEnemyUnit(playerSide, getBoardSpace(board, space)),
    );

    // If there is more than one enemy space, the enemy blocks the diagonal
    if (enemySpaces.length > 1) {
      // Diagonal is blocked by enemy units
      return true;
    }
    // Diagonal is not blocked by enemy units
    return false;
  } catch {
    // Validation functions never throw - return false on any error
    // (e.g., malformed data, missing properties)
    return false;
  }
}
