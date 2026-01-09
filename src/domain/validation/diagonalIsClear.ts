import type {
  Board,
  BoardCoordinate,
  PlayerSide,
  ValidationResult,
} from '@entities';
import {
  getBoardSpace,
  getDiagonallyAdjacentSpaces,
  getOrthogonallyAdjacentSpaces,
} from '@queries';
import { hasEnemyUnit } from './unitPresence';

export function diagonalIsClear<TBoard extends Board>(
  playerSide: PlayerSide,
  board: TBoard,
  originCoordinate: BoardCoordinate<TBoard>,
  targetCoordinate: BoardCoordinate<TBoard>,
): ValidationResult {
  try {
    // Check if the origin space is a diagonal space
    const originDiagonalSpaces = getDiagonallyAdjacentSpaces(
      board,
      originCoordinate,
    );
    if (!originDiagonalSpaces.has(targetCoordinate)) {
      // Target space is not a diagonal space - check is irrelevant
      return {
        result: false,
        errorReason: 'Target space is not a diagonal space',
      };
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
      return {
        result: false,
        errorReason: 'Spaces are not diagonally adjacent',
      };
    }

    // Get the enemy spaces
    const enemySpaces = Array.from(sharedOrthogonalSpaces).filter((space) => {
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
      return {
        result: false,
        errorReason: 'Diagonal is blocked by enemy units',
      };
    }
    // Diagonal is not blocked by enemy units
    return {
      result: true,
    };
  } catch (error) {
    return {
      result: false,
      errorReason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
