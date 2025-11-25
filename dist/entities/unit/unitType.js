import { z } from "zod";
/**
 * The schema for a unit of troops.
 */
export const unitTypeSchema = z.object({
    id: z.string(),
    // The capitalized name of the unit.
    name: z.string(),
    // The traits of the unit.
    traits: z.array(z.string()),
    // The attack strength of the unit.
    attack: z.number().min(1).max(5),
    // The normal attack range of the unit.
    range: z.number().min(0).max(5),
    // The maximum movement speed of the unit.
    speed: z.number().min(1).max(5),
    // The flexibility value of the unit.
    flexibility: z.number().min(0).max(5),
    // The attack value required to reverse the unit.
    reverse: z.number().min(0).max(10),
    // The attack value required to retreat the unit.
    retreat: z.number().min(0).max(10),
    // The attack value required to rout the unit.
    rout: z.number().min(0).max(10),
    // The cost of the unit.
    cost: z.number().min(5).max(100),
    // The limit of units that can be included in a standard army.
    limit: z.number().min(1).max(20),
    // The number of cards the owner must discard when the unit is routed.
    routPenalty: z.number().min(0).max(5),
});
const _assertExactUnitType = true;
