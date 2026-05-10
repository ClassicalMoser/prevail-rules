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
        errorReason: 'Target space is not a diagonal space',
        result: false,
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
      [...originOrthogonalSpaces].filter((space) =>
        targetOrthogonalSpaces.has(space),
      ),
    );

    // Check if the spaces are diagonally adjacent
    // Diagonally adjacent spaces share exactly 2 orthogonal spaces
    if (sharedOrthogonalSpaces.size !== 2) {
      // Spaces are not diagonally adjacent - check is irrelevant
      return {
        errorReason: 'Spaces are not diagonally adjacent',
        result: false,
      };
    }

    // Get the enemy spaces
    const enemySpaces = [...sharedOrthogonalSpaces].filter((space) => {
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
        errorReason: 'Diagonal is blocked by enemy units',
        result: false,
      };
    }
    // Diagonal is not blocked by enemy units
    return {
      result: true,
    };
  } catch (error) {
    return {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
  }
}
