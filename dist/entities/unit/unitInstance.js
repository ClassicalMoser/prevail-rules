import { z } from "zod";
import { playerSideSchema } from "../player/playerSide.js";
import { unitTypeSchema } from "./unitType.js";
/**
 * The schema for a unit instance.
 */
export const unitInstanceSchema = z.object({
    /** Which player the unit belongs to. */
    playerSide: playerSideSchema,
    /** The type of unit this is an instance of. */
    unitType: unitTypeSchema,
    /** Which instance of the unit this is. */
    instanceNumber: z.number().min(1).max(20),
});
const _assertExactUnitInstance = true;
