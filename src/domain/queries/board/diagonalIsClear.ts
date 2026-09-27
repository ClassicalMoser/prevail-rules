import type { Board, Coordinate, PlayerSide } from '@entities';
import {
  getDiagonallyAdjacentSpaces,
  getOrthogonallyAdjacentSpaces,
} from './adjacency';
import { getBoardSpace } from './getBoardSpace';
import { hasEnemyUnit } from '../unitPresence/hasEnemyUnit';

export function diagonalIsClear(
  playerSide: PlayerSide,
  board: Board,
  originCoordinate: Coordinate,
  targetCoordinate: Coordinate,
): boolean {
  // Check if the origin space is a diagonally adjacent space
  const originDiagonalSpaces = getDiagonallyAdjacentSpaces(
    board,
    originCoordinate,
  );
  if (!originDiagonalSpaces.has(targetCoordinate)) {
    // Target space is not a diagonal space - check was called in error
    throw new Error(
      `Target space ${targetCoordinate} is not diagonally adjacent to ${originCoordinate}`,
    );
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
  const sharedOrthogonalSpaces = [...originOrthogonalSpaces].filter((space) =>
    targetOrthogonalSpaces.has(space),
  );

  // Get the enemy spaces
  const enemySpaces = sharedOrthogonalSpaces.filter((space) => {
    // Check if the space has an enemy unit
    const { result: hasEnemyUnitResult } = hasEnemyUnit(
      playerSide,
      getBoardSpace(board, space),
    );
    return hasEnemyUnitResult;
  });

  // If there is more than one enemy space, the enemy blocks the diagonal
  if (enemySpaces.length > 1) {
    // Diagonal is blocked by enemy units
    return false;
  }
  // Diagonal is not blocked by enemy units
  return true;
}
