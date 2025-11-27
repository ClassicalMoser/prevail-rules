import type { PlayerSide } from "../player/playerSide.js";
import type { UnitType } from "./unitType.js";
import { z } from "zod";
/**
 * The schema for a unit instance.
 */
export declare const unitInstanceSchema: z.ZodObject<{
    /** Which player the unit belongs to. */
    playerSide: z.ZodEnum<["black", "white"]>;
    /** The type of unit this is an instance of. */
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
    /** Which instance of the unit this is. */
    instanceNumber: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    playerSide: "black" | "white";
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
    instanceNumber: number;
}, {
    playerSide: "black" | "white";
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
    instanceNumber: number;
}>;
/**
 * An individual instance of a unit.
 */
export interface UnitInstance {
    /** Which player the unit belongs to. */
    playerSide: PlayerSide;
    /** The type of unit this is an instance of. */
    unitType: UnitType;
    /** Which instance of the unit this is. */
    instanceNumber: number;
}
//# sourceMappingURL=unitInstance.d.ts.map