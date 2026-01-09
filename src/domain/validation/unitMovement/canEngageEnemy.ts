import type { Board, BoardCoordinate, PlayerSide, UnitFacing } from '@entities';
import { hasSingleUnit } from '@entities';
import {
  getBackSpaces,
  getBoardSpace,
  getFlankingSpaces,
  getFrontSpaces,
  getOppositeFacing,
  getSpacesBehind,
} from '@queries';

/**
 * Incremental function to check whether engagement is legal from an adjacent space.
 *
 * @param unitSide - The side of the unit attempting to engage
 * @param board - The board object
 * @param destinationCoordinate - The coordinate to check if we can engage an enemy at
 * @param adjacentCoordinate - The coordinate at the time of this check (where we're moving from)
 * @param moveStartCoordinate - The coordinate at the beginning of the move
 * @param currentFacing - The facing of the unit at the time of this check
 * @param remainingFlexibility - The remaining flexibility at the time of this check
 * @returns True if we can engage an enemy at the given coordinate with the given facing, false otherwise
 */
export function canEngageEnemy<TBoard extends Board>(
  unitSide: PlayerSide,
  board: TBoard,
  destinationCoordinate: BoardCoordinate<TBoard>,
  adjacentCoordinate: BoardCoordinate<TBoard>,
  moveStartCoordinate: BoardCoordinate<TBoard>,
  currentFacing: UnitFacing,
  remainingFlexibility: number,
): boolean {
  try {
    // Check if the destination has an enemy unit
    const destinationSpace = getBoardSpace(board, destinationCoordinate);
    if (
      !hasSingleUnit(destinationSpace.unitPresence) ||
      destinationSpace.unitPresence.unit.playerSide === unitSide
    ) {
      // Destination space is not a single enemy unit
      // so we can't engage an enemy here
      return false;
    }

    // We're moving into an enemy space - need to check engagement rules
    const enemyFacing = destinationSpace.unitPresence.facing;

    // Validate adjacent coordinate exists
    getBoardSpace(board, adjacentCoordinate);

    // We're moving from a different space - check if we're coming from front/flank/back
    const enemyFrontSpaces = getFrontSpaces(
      board,
      destinationCoordinate,
      enemyFacing,
    );
    const enemyFlankSpaces = getFlankingSpaces(
      board,
      destinationCoordinate,
      enemyFacing,
    );
    const enemyBackSpaces = getBackSpaces(
      board,
      destinationCoordinate,
      enemyFacing,
    );

    // If coming from flank: no further checks needed.
    // Defending unit will be forced to face this unit.
    if (enemyFlankSpaces.has(adjacentCoordinate)) {
      return true;
    }

    // If coming from back: must have started move behind the enemy.
    if (enemyBackSpaces.has(adjacentCoordinate)) {
      const spacesBehindEnemy = getSpacesBehind(
        board,
        destinationCoordinate,
        enemyFacing,
      );
      if (spacesBehindEnemy.has(moveStartCoordinate)) {
        // We can engage an enemy from the back if we started the move behind them.
        return true;
      }
      // We can't engage an enemy from the back if we didn't start the move behind them.
      return false;
    }

    // If coming from front: must end facing opposite to the enemy
    if (enemyFrontSpaces.has(adjacentCoordinate)) {
      const requiredFacing = getOppositeFacing(enemyFacing);
      // If we're already facing the required direction, we can engage the enemy.
      if (currentFacing === requiredFacing) {
        return true;
      }
      // If we're coming from an angle and need to rotate, we need at least 1 flexibility
      if (remainingFlexibility > 0) {
        // We have flexibility to rotate, so we can engage the enemy.
        return true;
      }

      // Can't rotate to face the enemy, so we can't engage the enemy.
      return false;
    }

    // We're not adjacent to the enemy, so we can't validate engagement.
    return false;
  } catch {
    // Any error means we cannot engage the enemy.
    return false;
  }
}
