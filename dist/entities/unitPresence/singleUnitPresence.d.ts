import type { UnitFacing } from "../unit/unitFacing.js";
import type { UnitInstance } from "../unit/unitInstance.js";
import { z } from "zod";
/**
 * The schema for a single unit presence in a space.
 */
export declare const singleUnitPresenceSchema: z.ZodObject<{
    /** A single unit is present in the space. */
    presenceType: z.ZodLiteral<"single">;
    /** The unit in the space. */
    unit: z.ZodObject<{
        playerSide: z.ZodEnum<["black", "white"]>;
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
    /** The facing direction of the unit. */
    facing: z.ZodEnum<["north", "east", "south", "west", "northEast", "southEast", "southWest", "northWest"]>;
}, "strip", z.ZodTypeAny, {
    presenceType: "single";
    unit: {
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
    };
    facing: "north" | "east" | "south" | "west" | "northEast" | "southEast" | "southWest" | "northWest";
}, {
    presenceType: "single";
    unit: {
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
    };
    facing: "north" | "east" | "south" | "west" | "northEast" | "southEast" | "southWest" | "northWest";
}>;
/**
 * A single unit is present in the space.
 */
export interface SingleUnitPresence {
    /** A single unit is present in the space. */
    presenceType: "single";
    /** The unit in the space. */
    unit: UnitInstance;
    /** The facing direction of the unit. */
    facing: UnitFacing;
}
//# sourceMappingURL=singleUnitPresence.d.ts.map