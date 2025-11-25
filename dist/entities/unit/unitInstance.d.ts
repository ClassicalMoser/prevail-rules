import type { UnitType } from "./unitType.js";
import { z } from "zod";
/**
 * The schema for a unit instance.
 */
export declare const unitInstanceSchema: z.ZodObject<{
    instanceNumber: z.ZodNumber;
    unitType: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        traits: z.ZodArray<z.ZodString, "many">;
        attack: z.ZodNumber;
        range: z.ZodNumber;
        speed: z.ZodNumber;
        flexibility: z.ZodNumber;
        reverse: z.ZodNumber;
        retreat: z.ZodNumber;
        rout: z.ZodNumber;
        cost: z.ZodNumber;
        limit: z.ZodNumber;
        routPenalty: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        reverse: number;
        id: string;
        name: string;
        traits: string[];
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
        traits: string[];
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
}, "strip", z.ZodTypeAny, {
    instanceNumber: number;
    unitType: {
        reverse: number;
        id: string;
        name: string;
        traits: string[];
        attack: number;
        range: number;
        speed: number;
        flexibility: number;
        retreat: number;
        rout: number;
        cost: number;
        limit: number;
        routPenalty: number;
    };
}, {
    instanceNumber: number;
    unitType: {
        reverse: number;
        id: string;
        name: string;
        traits: string[];
        attack: number;
        range: number;
        speed: number;
        flexibility: number;
        retreat: number;
        rout: number;
        cost: number;
        limit: number;
        routPenalty: number;
    };
}>;
/**
 * An individual instance of a unit.
 */
export interface UnitInstance {
    /** Which instance of the unit this is. */
    instanceNumber: number;
    /** The type of unit this is an instance of. */
    unitType: UnitType;
}
//# sourceMappingURL=unitInstance.d.ts.map