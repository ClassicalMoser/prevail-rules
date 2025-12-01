import type { PlayerSide } from "../player/playerSide.js";
import type { UnitPresence } from "../unitPresence/unitPresence.js";
import type { Elevation } from "./elevation.js";
import type { TerrainType } from "./terrainTypes.js";
import type { WaterCover } from "./waterCover.js";
import { z } from "zod";
/**
 * The schema for a space of the game board.
 */
export declare const boardSpaceSchema: z.ZodObject<{
    /**
     * The type of terrain in the space.
     */
    terrainType: z.ZodDefault<z.ZodEnum<["plain", "rocks", "scrub", "lightForest", "denseForest"]>>;
    /**
     * The elevation of the space.
     */
    elevation: z.ZodObject<{
        northWest: z.ZodDefault<z.ZodNumber>;
        northEast: z.ZodDefault<z.ZodNumber>;
        southWest: z.ZodDefault<z.ZodNumber>;
        southEast: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        northEast: number;
        southEast: number;
        southWest: number;
        northWest: number;
    }, {
        northEast?: number | undefined;
        southEast?: number | undefined;
        southWest?: number | undefined;
        northWest?: number | undefined;
    }>;
    /**
     * The water cover of the space.
     */
    waterCover: z.ZodObject<{
        north: z.ZodDefault<z.ZodBoolean>;
        northEast: z.ZodDefault<z.ZodBoolean>;
        east: z.ZodDefault<z.ZodBoolean>;
        southEast: z.ZodDefault<z.ZodBoolean>;
        south: z.ZodDefault<z.ZodBoolean>;
        southWest: z.ZodDefault<z.ZodBoolean>;
        west: z.ZodDefault<z.ZodBoolean>;
        northWest: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        north: boolean;
        east: boolean;
        south: boolean;
        west: boolean;
        northEast: boolean;
        southEast: boolean;
        southWest: boolean;
        northWest: boolean;
    }, {
        north?: boolean | undefined;
        east?: boolean | undefined;
        south?: boolean | undefined;
        west?: boolean | undefined;
        northEast?: boolean | undefined;
        southEast?: boolean | undefined;
        southWest?: boolean | undefined;
        northWest?: boolean | undefined;
    }>;
    /**
     * The unit presence in the space.
     */
    unitPresence: z.ZodDiscriminatedUnion<"presenceType", [z.ZodObject<{
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
     * The commanders in the space.
     */
    commanders: z.ZodSet<z.ZodEnum<["black", "white"]>>;
}, "strip", z.ZodTypeAny, {
    terrainType: "plain" | "rocks" | "scrub" | "lightForest" | "denseForest";
    elevation: {
        northEast: number;
        southEast: number;
        southWest: number;
        northWest: number;
    };
    waterCover: {
        north: boolean;
        east: boolean;
        south: boolean;
        west: boolean;
        northEast: boolean;
        southEast: boolean;
        southWest: boolean;
        northWest: boolean;
    };
    unitPresence: {
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
    } | {
        presenceType: "none";
    } | {
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
    };
    commanders: Set<"black" | "white">;
}, {
    elevation: {
        northEast?: number | undefined;
        southEast?: number | undefined;
        southWest?: number | undefined;
        northWest?: number | undefined;
    };
    waterCover: {
        north?: boolean | undefined;
        east?: boolean | undefined;
        south?: boolean | undefined;
        west?: boolean | undefined;
        northEast?: boolean | undefined;
        southEast?: boolean | undefined;
        southWest?: boolean | undefined;
        northWest?: boolean | undefined;
    };
    unitPresence: {
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
    } | {
        presenceType: "none";
    } | {
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
    };
    commanders: Set<"black" | "white">;
    terrainType?: "plain" | "rocks" | "scrub" | "lightForest" | "denseForest" | undefined;
}>;
/**
 * A space of the game board.
 */
export interface BoardSpace {
    /**
     * The type of terrain in the space.
     */
    terrainType: TerrainType;
    /**
     * The elevation of the space.
     */
    elevation: Elevation;
    /**
     * The water cover of the space.
     */
    waterCover: WaterCover;
    /**
     * The unit presence in the space.
     */
    unitPresence: UnitPresence;
    /**
     * The commanders in the space.
     */
    commanders: Set<PlayerSide>;
}
//# sourceMappingURL=boardSpace.d.ts.map