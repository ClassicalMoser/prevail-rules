import type { UnitType } from "src/entities/unit/unitType.js";
/** Basic utility function to get a unit by a specific stat value.
 * This helps to write tests that consider unit values without making
 * them too brittle.
 */
export declare function getUnitByStatValue(stat: keyof UnitType, value: number): UnitType | undefined;
//# sourceMappingURL=getUnitByStatValue.d.ts.map