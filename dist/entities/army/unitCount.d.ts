import type { UnitType } from "../unit/unitType.js";
import { z } from "zod";
export declare const unitCountSchema: z.ZodObject<{
    /** The unit type. */
    unitType: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        traits: z.ZodArray<z.ZodEnum<["formation", "sword", "spear", "phalanx", "skirmish", "javelin", "mounted", "horse"]>, "many">;
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
    /** The number of units. */
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    unitType: {
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
    };
    count: number;
}, {
    unitType: {
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
    };
    count: number;
}>;
/**
 * A count of units of a specific type.
 */
export interface UnitCount {
    /** The unit type. */
    unitType: UnitType;
    /** The number of units. */
    count: number;
}
//# sourceMappingURL=unitCount.d.ts.map