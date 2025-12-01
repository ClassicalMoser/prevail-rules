import type { EngagedUnitPresence } from "./engagedUnitPresence.js";
import type { NoneUnitPresence } from "./noneUnitPresence.js";
import type { SingleUnitPresence } from "./singleUnitPresence.js";
import { z } from "zod";
/**
 * The schema for unit presence in a space.
 */
export declare const unitPresenceSchema: z.ZodDiscriminatedUnion<"presenceType", [z.ZodObject<{
    presenceType: z.ZodLiteral<"none">;
}, "strip", z.ZodTypeAny, {
    presenceType: "none";
}, {
    presenceType: "none";
}>, z.ZodObject<{
    presenceType: z.ZodLiteral<"single">;
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
}>, z.ZodObject<{
    presenceType: z.ZodLiteral<"engaged">;
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
    primaryFacing: z.ZodEnum<["north", "east", "south", "west", "northEast", "southEast", "southWest", "northWest"]>;
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
    primaryFacing: "north" | "east" | "south" | "west" | "northEast" | "southEast" | "southWest" | "northWest";
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
    primaryFacing: "north" | "east" | "south" | "west" | "northEast" | "southEast" | "southWest" | "northWest";
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
}>]>;
/**
 * Unit presence in a space.
 */
export type UnitPresence = NoneUnitPresence | SingleUnitPresence | EngagedUnitPresence;
//# sourceMappingURL=unitPresence.d.ts.map