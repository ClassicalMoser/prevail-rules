import { tempUnits } from "src/sampleValues/tempUnits.js";
/** Basic utility function to get a unit by a specific stat value.
 * This helps to write tests that consider unit values without making
 * them too brittle.
 */
export function getUnitByStatValue(stat, value) {
    const unit = tempUnits.find((unit) => unit[stat] === value);
    if (!unit) {
        throw new Error(`No unit found with ${stat} value ${value}.`);
    }
    return unit;
}
