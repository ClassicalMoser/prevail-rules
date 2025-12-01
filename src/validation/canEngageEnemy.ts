import type { Board } from "src/entities/board/board.js";
import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import type { UnitInstance } from "src/entities/unit/unitInstance.js";
import { getBackSpaces } from "src/functions/boardSpace/adjacency/getBackSpaces.js";
import { getFlankingSpaces } from "src/functions/boardSpace/adjacency/getFlankingSpaces.js";
import { getFrontSpaces } from "src/functions/boardSpace/adjacency/getFrontSpaces.js";
import { getSpacesBehind } from "src/functions/boardSpace/areas/getSpacesBehind.js";
import { getBoardSpace } from "src/functions/boardSpace/getBoardSpace.js";
import { getOppositeFacing } from "src/functions/facings/getOppositeFacing.js";

/**
 * Incremental function to check whether engagement is legal from an adjacent space.
 *
 * @param unit - The unit attempting to engage
 * @param board - The board object
 * @param destinationCoordinate - The coordinate to check if we can engage an enemy at
 * @param adjacentFacing - The facing at the time of this check
 * @param adjacentCoordinate - The coordinate at the time of this check (where we're moving from)
 * @param remainingFlexibility - The remaining flexibility at the time of this check
 * @param moveStartCoordinate - The coordinate at the beginning of the move
 * @returns True if we can engage an enemy at the given coordinate with the given facing, false otherwise
 */
export function canEngageEnemy<TBoard extends Board>(
  unit: UnitInstance,
  board: TBoard,
  destinationCoordinate: BoardCoordinate<TBoard>,
  adjacentFacing: UnitFacing,
  adjacentCoordinate: BoardCoordinate<TBoard>,
  remainingFlexibility: number,
  moveStartCoordinate: BoardCoordinate<TBoard>,
): boolean {
  // Check if the destination has an enemy unit
  let destinationSpace;
  try {
    destinationSpace = getBoardSpace(board, destinationCoordinate);
    if (
      destinationSpace.unitPresence.presenceType !== "single" ||
      destinationSpace.unitPresence.unit.playerSide === unit.playerSide
    ) {
      // Destination space is not a single enemy unit
      // so we can't engage an enemy here
      return false;
    }
  } catch {
    // Invalid coordinate
    return false;
  }

  // We're moving into an enemy space - need to check engagement rules
  const enemyFacing = destinationSpace.unitPresence.facing;

  // Validate adjacent coordinate exists
  try {
    getBoardSpace(board, adjacentCoordinate);
  } catch {
    // Invalid adjacent coordinate
    return false;
  }

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
    if (adjacentFacing === requiredFacing) {
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
}
