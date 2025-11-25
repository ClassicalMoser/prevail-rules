import { z } from "zod";
import { unitTypeSchema } from "../unit/unitType.js";
export const unitCountSchema = z.object({
    /** The unit type. */
    unitType: unitTypeSchema,
    /** The number of units. */
    count: z.number().int().min(1).max(20),
});
/**
 * Check that the unit count type matches the schema.
 */
const _assertExactUnitCount = true;
