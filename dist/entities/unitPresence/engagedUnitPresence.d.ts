import type { UnitFacing } from "../unit/unitFacing.js";
import type { UnitInstance } from "../unit/unitInstance.js";
import { z } from "zod";
/**
 * The schema for two units engaged in combat in a space.
 */
export declare const engagedUnitPresenceSchema: z.ZodObject<{
    /** Two units are engaged in combat in the space. */
    presenceType: z.ZodLiteral<"engaged">;
    /** The primary unit in the engagement. */
    primaryUnit: z.ZodObject<{
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
    /** The facing direction of the primary unit. */
    primaryFacing: z.ZodEnum<["north", "northEast", "east", "southEast", "south", "southWest", "west", "northWest"]>;
    /** The secondary unit in the engagement (facing opposite the primary unit). */
    secondaryUnit: z.ZodObject<{
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
}, "strip", z.ZodTypeAny, {
    presenceType: "engaged";
    primaryUnit: {
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
    primaryFacing: "north" | "northEast" | "east" | "southEast" | "south" | "southWest" | "west" | "northWest";
    secondaryUnit: {
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
}, {
    presenceType: "engaged";
    primaryUnit: {
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
    primaryFacing: "north" | "northEast" | "east" | "southEast" | "south" | "southWest" | "west" | "northWest";
    secondaryUnit: {
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
}>;
/**
 * Two units are engaged in combat in the space.
 */
export interface EngagedUnitPresence {
    /** Two units are engaged in combat in the space. */
    presenceType: "engaged";
    /** The primary unit in the engagement. */
    primaryUnit: UnitInstance;
    /** The facing direction of the primary unit. */
    primaryFacing: UnitFacing;
    /** The secondary unit in the engagement (facing opposite the primary unit). */
    secondaryUnit: UnitInstance;
}
//# sourceMappingURL=engagedUnitPresence.d.ts.map