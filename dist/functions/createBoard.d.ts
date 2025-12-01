import type { StandardBoard, StandardBoardCoordinate, UnitFacing, UnitInstance } from "src/entities/index.js";
import type { PlayerSide } from "src/entities/player/playerSide.js";
import type { UnitType } from "src/entities/unit/unitType.js";
/**
 * Creates a board with units at specified positions.
 * This is a core domain operation for setting up game states.
 *
 * @param units - Array of unit placements, each specifying unit, coordinate, and facing
 * @returns A standard board with the specified units placed
 */
export declare function createBoardWithUnits(units: Array<{
    unit: UnitInstance;
    coordinate: StandardBoardCoordinate;
    facing: UnitFacing;
}>): StandardBoard;
/**
 * Creates a board with a single unit at a coordinate.
 * This is a convenience function for common test and setup scenarios.
 *
 * @param coord - The coordinate where the unit should be placed
 * @param playerSide - The player side of the unit
 * @param options - Optional configuration for the unit
 * @param options.unitType - Specific unit type to use (if not provided, will use stat-based lookup)
 * @param options.flexibility - Flexibility stat value (used if unitType not provided)
 * @param options.attack - Attack stat value (used if unitType not provided)
 * @param options.facing - Unit facing (defaults to "north")
 * @param options.instanceNumber - Unit instance number (defaults to 1)
 * @returns A standard board with the specified unit placed
 */
export declare function createBoardWithSingleUnit(coord: StandardBoardCoordinate, playerSide: PlayerSide, options?: {
    unitType?: UnitType;
    flexibility?: number;
    attack?: number;
    facing?: UnitFacing;
    instanceNumber?: number;
}): StandardBoard;
/**
 * Creates a board with engaged units at a coordinate.
 * This represents two units in combat at the same space.
 *
 * @param primaryUnit - The primary unit in the engagement
 * @param secondaryUnit - The secondary unit in the engagement
 * @param coord - The coordinate where the engagement occurs (defaults to "E-5")
 * @param primaryFacing - The facing of the primary unit (defaults to "north")
 * @returns A standard board with the engaged units placed
 */
export declare function createBoardWithEngagedUnits(primaryUnit: UnitInstance, secondaryUnit: UnitInstance, coord?: StandardBoardCoordinate, primaryFacing?: UnitFacing): StandardBoard;
/**
 * Creates a board with a commander at a coordinate.
 * Commanders are special units that can move independently.
 *
 * @param playerSide - The player side of the commander
 * @param coordinate - The coordinate where the commander should be placed
 * @param board - Optional existing board to modify (creates new board if not provided)
 * @returns A standard board with the commander placed
 */
export declare function createBoardWithCommander(playerSide: PlayerSide, coordinate: StandardBoardCoordinate, board?: StandardBoard): StandardBoard;
//# sourceMappingURL=createBoard.d.ts.map