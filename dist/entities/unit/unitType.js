import { z } from "zod";
import { traitSchema } from "./traits.js";
/**
 * The schema for a unit of troops.
 */
export const unitTypeSchema = z.object({
    // Not sure yet how the units will be identified,
    // but we need to have a unique identifier for each unit type.
    id: z.string(),
    // The name of the unit, capitalized with spaces.
    name: z.string(),
    // The traits of the unit.
    traits: z.array(traitSchema),
    // The attack strength of the unit.
    attack: z.number().int().min(1).max(5),
    // The normal attack range of the unit.
    range: z.number().int().min(0).max(5),
    // The maximum movement speed of the unit.
    speed: z.number().int().min(1).max(5),
    // The flexibility value of the unit.
    flexibility: z.number().int().min(0).max(5),
    // The attack value required to reverse the unit.
    reverse: z.number().int().min(0).max(10),
    // The attack value required to retreat the unit.
    retreat: z.number().int().min(0).max(10),
    // The attack value required to rout the unit.
    rout: z.number().int().min(0).max(10),
    // The cost of the unit.
    cost: z.number().int().min(5).max(100),
    // The limit of units that can be included in a standard army.
    limit: z.number().int().min(1).max(20),
    // The number of cards the owner must discard when the unit is routed.
    routPenalty: z.number().int().min(0).max(5),
});
const _assertExactUnitType = true;
