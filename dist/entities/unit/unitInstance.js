import { z } from "zod";
import { unitTypeSchema } from "./unitType.js";
/**
 * The schema for a unit instance.
 */
export const unitInstanceSchema = z.object({
    instanceNumber: z.number().min(1).max(20),
    unitType: unitTypeSchema,
});
const _assertExactUnitInstance = true;
