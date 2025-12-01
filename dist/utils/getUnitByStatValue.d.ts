import type { UnitType } from "src/entities/unit/unitType.js";
/**
 * Finds a unit type by matching a specific stat value.
 *
 * @param stat - The stat name to search by
 * @param value - The stat value to match
 * @returns The matching unit type, or undefined if no match is found
 * @throws {Error} If no unit is found with the specified stat value
 */
export declare function getUnitByStatValue(stat: keyof UnitType, value: number): UnitType | undefined;
//# sourceMappingURL=getUnitByStatValue.d.ts.map