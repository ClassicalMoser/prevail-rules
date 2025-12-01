import type { PlayerSide } from "src/entities/player/playerSide.js";
import type { UnitInstance } from "src/entities/unit/unitInstance.js";
import type { UnitType } from "src/entities/unit/unitType.js";
/**
 * Creates a unit instance for testing with sensible defaults.
 * This is a convenience wrapper around createUnitInstance that makes tests
 * less verbose while maintaining flexibility.
 *
 * @param playerSide - Which player the unit belongs to
 * @param options - Optional configuration for the unit
 * @param options.unitType - Specific unit type to use (if not provided, will use stat-based lookup)
 * @param options.instanceNumber - Unit instance number (defaults to 1)
 * @param options.flexibility - Flexibility stat value (used if unitType not provided)
 * @param options.attack - Attack stat value (used if unitType not provided)
 * @returns A unit instance configured for testing
 */
export declare function createTestUnit(playerSide: PlayerSide, options?: {
    unitType?: UnitType;
    instanceNumber?: number;
    flexibility?: number;
    attack?: number;
}): UnitInstance;
/**
 * Creates a unit instance by looking up a unit with a specific stat value.
 * This is a convenience wrapper around getUnitByStatValue and createUnitInstance.
 *
 * @param playerSide - The player side of the unit
 * @param stat - The stat name to search by
 * @param value - The stat value to match
 * @param instanceNumber - Unit instance number (defaults to 1)
 * @returns A unit instance with the specified stat value
 */
export declare function createUnitByStat(playerSide: PlayerSide, stat: keyof UnitType, value: number, instanceNumber?: number): UnitInstance;
//# sourceMappingURL=unitHelpers.d.ts.map