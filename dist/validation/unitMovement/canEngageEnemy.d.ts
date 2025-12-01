import type { Board } from "src/entities/board/board.js";
import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import type { UnitInstance } from "src/entities/unit/unitInstance.js";
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
export declare function canEngageEnemy<TBoard extends Board>(unit: UnitInstance, board: TBoard, destinationCoordinate: BoardCoordinate<TBoard>, adjacentFacing: UnitFacing, adjacentCoordinate: BoardCoordinate<TBoard>, remainingFlexibility: number, moveStartCoordinate: BoardCoordinate<TBoard>): boolean;
//# sourceMappingURL=canEngageEnemy.d.ts.map