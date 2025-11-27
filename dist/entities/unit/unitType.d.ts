import type { Trait } from "../../sampleValues/traits.js";
import { z } from "zod";
/**
 * The schema for a unit of troops.
 */
export declare const unitTypeSchema: z.ZodObject<{
    /** Not sure yet how the units will be identified,
     * but we need to have a unique identifier for each unit type.
     */
    id: z.ZodString;
    /** The name of the unit, capitalized with spaces. */
    name: z.ZodString;
    /** The traits of the unit. */
    traits: z.ZodArray<z.ZodEnum<["formation", "sword", "spear", "phalanx", "skirmish", "javelin", "mounted", "horse"]>, "many">;
    /** The attack strength of the unit. */
    attack: z.ZodNumber;
    /** The normal attack range of the unit. */
    range: z.ZodNumber;
    /** The maximum movement speed of the unit. */
    speed: z.ZodNumber;
    /** The flexibility value of the unit. */
    flexibility: z.ZodNumber;
    /** The attack value required to reverse the unit. */
    reverse: z.ZodNumber;
    /** The attack value required to retreat the unit. */
    retreat: z.ZodNumber;
    /** The attack value required to rout the unit. */
    rout: z.ZodNumber;
    /** The cost of the unit. */
    cost: z.ZodNumber;
    /** The limit of units that can be included in a standard army. */
    limit: z.ZodNumber;
    /** The number of cards the owner must discard when the unit is routed. */
    routPenalty: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    reverse: number;
    id: string;
    name: string;
    traits: ("formation" | "sword" | "spear" | "phalanx" | "skirmish" | "javelin" | "mounted" | "horse")[];
    attack: number;
    range: number;
    speed: number;
    flexibility: number;
    retreat: number;
    rout: number;
    cost: number;
    limit: number;
    routPenalty: number;
}, {
    reverse: number;
    id: string;
    name: string;
    traits: ("formation" | "sword" | "spear" | "phalanx" | "skirmish" | "javelin" | "mounted" | "horse")[];
    attack: number;
    range: number;
    speed: number;
    flexibility: number;
    retreat: number;
    rout: number;
    cost: number;
    limit: number;
    routPenalty: number;
}>;
/**
 * A unit of troops.
 */
export interface UnitType {
    /** The unique identifier of the unit. */
    id: string;
    /** The capitalized name of the unit. */
    name: string;
    /** The traits of the unit. */
    traits: Trait[];
    /** The attack strength of the unit. */
    attack: number;
    /** The normal attack range of the unit. */
    range: number;
    /** The maximum movement speed of the unit. */
    speed: number;
    /** The flexibility value of the unit. */
    flexibility: number;
    /** The attack value required to reverse the unit. */
    reverse: number;
    /** The attack value required to retreat the unit. */
    retreat: number;
    /** The attack value required to rout the unit. */
    rout: number;
    /** The cost of the unit. */
    cost: number;
    /** The limit of units that can be included in a standard army. */
    limit: number;
    /** The number of cards the owner must discard when the unit is routed. */
    routPenalty: number;
}
//# sourceMappingURL=unitType.d.ts.map