import type { Board, PlayerSide } from '@entities';
import type { Coordinate } from '@ruleValues';
import { getBoardSpace } from './getBoardSpace';
import { getDiagonalCornerSpaces } from './getDiagonalCornerSpaces';
import { hasEnemyUnit } from '../unitPresence/hasEnemyUnit';

/**
 * Whether a diagonal is open to this side: it is blocked only when enemy units
 * stand in both of the orthogonal spaces that flank it, and one enemy does not
 * block it (§2.4.4). Commanders and melee support ask exactly this; a mover's
 * own stricter question is `checkDiagonalMove`.
 *
 * @param playerSide - The side whose enemies are counted.
 * @param board - The board to read.
 * @param originCoordinate - The space the diagonal starts from.
 * @param targetCoordinate - The diagonally adjacent space it reaches.
 * @returns `false` when the enemy blocks the diagonal, otherwise `true`.
 * @throws When the target is not diagonally adjacent to the origin.
 */
export function diagonalIsClear(
  playerSide: PlayerSide,
  board: Board,
  originCoordinate: Coordinate,
  targetCoordinate: Coordinate,
): boolean {
  // The two spaces the diagonal cuts between. Asking of a target that is not
  // a diagonal neighbour throws there: it has no corners to block it.
  const corners = getDiagonalCornerSpaces(
    board,
    originCoordinate,
    targetCoordinate,
  );

  // Get the enemy spaces
  const enemySpaces = corners.filter((space) => {
    // Check if the space has an enemy unit
    const hasEnemyUnitResult = hasEnemyUnit(
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
