import type { BoardSpace } from "../boardSpace.js";
import type { StandardBoardCoordinate } from "./standardCoordinates.js";
import { z } from "zod";
/**
 * The schema for a standard board.
 */
export declare const standardBoardSchema: z.ZodObject<{
    boardType: z.ZodLiteral<"standard">;
    board: z.ZodObject<Record<"A-1" | "A-2" | "A-3" | "A-4" | "A-5" | "A-6" | "A-7" | "A-8" | "A-9" | "A-10" | "A-11" | "A-12" | "A-13" | "A-14" | "A-15" | "A-16" | "A-17" | "A-18" | "B-1" | "B-2" | "B-3" | "B-4" | "B-5" | "B-6" | "B-7" | "B-8" | "B-9" | "B-10" | "B-11" | "B-12" | "B-13" | "B-14" | "B-15" | "B-16" | "B-17" | "B-18" | "C-1" | "C-2" | "C-3" | "C-4" | "C-5" | "C-6" | "C-7" | "C-8" | "C-9" | "C-10" | "C-11" | "C-12" | "C-13" | "C-14" | "C-15" | "C-16" | "C-17" | "C-18" | "D-1" | "D-2" | "D-3" | "D-4" | "D-5" | "D-6" | "D-7" | "D-8" | "D-9" | "D-10" | "D-11" | "D-12" | "D-13" | "D-14" | "D-15" | "D-16" | "D-17" | "D-18" | "E-1" | "E-2" | "E-3" | "E-4" | "E-5" | "E-6" | "E-7" | "E-8" | "E-9" | "E-10" | "E-11" | "E-12" | "E-13" | "E-14" | "E-15" | "E-16" | "E-17" | "E-18" | "F-1" | "F-2" | "F-3" | "F-4" | "F-5" | "F-6" | "F-7" | "F-8" | "F-9" | "F-10" | "F-11" | "F-12" | "F-13" | "F-14" | "F-15" | "F-16" | "F-17" | "F-18" | "G-1" | "G-2" | "G-3" | "G-4" | "G-5" | "G-6" | "G-7" | "G-8" | "G-9" | "G-10" | "G-11" | "G-12" | "G-13" | "G-14" | "G-15" | "G-16" | "G-17" | "G-18" | "H-1" | "H-2" | "H-3" | "H-4" | "H-5" | "H-6" | "H-7" | "H-8" | "H-9" | "H-10" | "H-11" | "H-12" | "H-13" | "H-14" | "H-15" | "H-16" | "H-17" | "H-18" | "I-1" | "I-2" | "I-3" | "I-4" | "I-5" | "I-6" | "I-7" | "I-8" | "I-9" | "I-10" | "I-11" | "I-12" | "I-13" | "I-14" | "I-15" | "I-16" | "I-17" | "I-18" | "J-1" | "J-2" | "J-3" | "J-4" | "J-5" | "J-6" | "J-7" | "J-8" | "J-9" | "J-10" | "J-11" | "J-12" | "J-13" | "J-14" | "J-15" | "J-16" | "J-17" | "J-18" | "K-1" | "K-2" | "K-3" | "K-4" | "K-5" | "K-6" | "K-7" | "K-8" | "K-9" | "K-10" | "K-11" | "K-12" | "K-13" | "K-14" | "K-15" | "K-16" | "K-17" | "K-18" | "L-1" | "L-2" | "L-3" | "L-4" | "L-5" | "L-6" | "L-7" | "L-8" | "L-9" | "L-10" | "L-11" | "L-12" | "L-13" | "L-14" | "L-15" | "L-16" | "L-17" | "L-18", z.ZodObject<{
        terrainType: z.ZodDefault<z.ZodEnum<["plain", "rocks", "scrub", "lightForest", "denseForest"]>>;
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
            northEast: boolean;
            east: boolean;
            southEast: boolean;
            south: boolean;
            southWest: boolean;
            west: boolean;
            northWest: boolean;
        }, {
            north?: boolean | undefined;
            northEast?: boolean | undefined;
            east?: boolean | undefined;
            southEast?: boolean | undefined;
            south?: boolean | undefined;
            southWest?: boolean | undefined;
            west?: boolean | undefined;
            northWest?: boolean | undefined;
        }>;
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
            facing: z.ZodEnum<["north", "northEast", "east", "southEast", "south", "southWest", "west", "northWest"]>;
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
            facing: "north" | "northEast" | "east" | "southEast" | "south" | "southWest" | "west" | "northWest";
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
            facing: "north" | "northEast" | "east" | "southEast" | "south" | "southWest" | "west" | "northWest";
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
            primaryFacing: z.ZodEnum<["north", "northEast", "east", "southEast", "south", "southWest", "west", "northWest"]>;
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
        }>]>;
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
            northEast: boolean;
            east: boolean;
            southEast: boolean;
            south: boolean;
            southWest: boolean;
            west: boolean;
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
            facing: "north" | "northEast" | "east" | "southEast" | "south" | "southWest" | "west" | "northWest";
        };
    }, {
        elevation: {
            northEast?: number | undefined;
            southEast?: number | undefined;
            southWest?: number | undefined;
            northWest?: number | undefined;
        };
        waterCover: {
            north?: boolean | undefined;
            northEast?: boolean | undefined;
            east?: boolean | undefined;
            southEast?: boolean | undefined;
            south?: boolean | undefined;
            southWest?: boolean | undefined;
            west?: boolean | undefined;
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
            facing: "north" | "northEast" | "east" | "southEast" | "south" | "southWest" | "west" | "northWest";
        };
        terrainType?: "plain" | "rocks" | "scrub" | "lightForest" | "denseForest" | undefined;
    }>>, "strip", z.ZodTypeAny, Record<"A-1" | "A-2" | "A-3" | "A-4" | "A-5" | "A-6" | "A-7" | "A-8" | "A-9" | "A-10" | "A-11" | "A-12" | "A-13" | "A-14" | "A-15" | "A-16" | "A-17" | "A-18" | "B-1" | "B-2" | "B-3" | "B-4" | "B-5" | "B-6" | "B-7" | "B-8" | "B-9" | "B-10" | "B-11" | "B-12" | "B-13" | "B-14" | "B-15" | "B-16" | "B-17" | "B-18" | "C-1" | "C-2" | "C-3" | "C-4" | "C-5" | "C-6" | "C-7" | "C-8" | "C-9" | "C-10" | "C-11" | "C-12" | "C-13" | "C-14" | "C-15" | "C-16" | "C-17" | "C-18" | "D-1" | "D-2" | "D-3" | "D-4" | "D-5" | "D-6" | "D-7" | "D-8" | "D-9" | "D-10" | "D-11" | "D-12" | "D-13" | "D-14" | "D-15" | "D-16" | "D-17" | "D-18" | "E-1" | "E-2" | "E-3" | "E-4" | "E-5" | "E-6" | "E-7" | "E-8" | "E-9" | "E-10" | "E-11" | "E-12" | "E-13" | "E-14" | "E-15" | "E-16" | "E-17" | "E-18" | "F-1" | "F-2" | "F-3" | "F-4" | "F-5" | "F-6" | "F-7" | "F-8" | "F-9" | "F-10" | "F-11" | "F-12" | "F-13" | "F-14" | "F-15" | "F-16" | "F-17" | "F-18" | "G-1" | "G-2" | "G-3" | "G-4" | "G-5" | "G-6" | "G-7" | "G-8" | "G-9" | "G-10" | "G-11" | "G-12" | "G-13" | "G-14" | "G-15" | "G-16" | "G-17" | "G-18" | "H-1" | "H-2" | "H-3" | "H-4" | "H-5" | "H-6" | "H-7" | "H-8" | "H-9" | "H-10" | "H-11" | "H-12" | "H-13" | "H-14" | "H-15" | "H-16" | "H-17" | "H-18" | "I-1" | "I-2" | "I-3" | "I-4" | "I-5" | "I-6" | "I-7" | "I-8" | "I-9" | "I-10" | "I-11" | "I-12" | "I-13" | "I-14" | "I-15" | "I-16" | "I-17" | "I-18" | "J-1" | "J-2" | "J-3" | "J-4" | "J-5" | "J-6" | "J-7" | "J-8" | "J-9" | "J-10" | "J-11" | "J-12" | "J-13" | "J-14" | "J-15" | "J-16" | "J-17" | "J-18" | "K-1" | "K-2" | "K-3" | "K-4" | "K-5" | "K-6" | "K-7" | "K-8" | "K-9" | "K-10" | "K-11" | "K-12" | "K-13" | "K-14" | "K-15" | "K-16" | "K-17" | "K-18" | "L-1" | "L-2" | "L-3" | "L-4" | "L-5" | "L-6" | "L-7" | "L-8" | "L-9" | "L-10" | "L-11" | "L-12" | "L-13" | "L-14" | "L-15" | "L-16" | "L-17" | "L-18", BoardSpace>, Record<"A-1" | "A-2" | "A-3" | "A-4" | "A-5" | "A-6" | "A-7" | "A-8" | "A-9" | "A-10" | "A-11" | "A-12" | "A-13" | "A-14" | "A-15" | "A-16" | "A-17" | "A-18" | "B-1" | "B-2" | "B-3" | "B-4" | "B-5" | "B-6" | "B-7" | "B-8" | "B-9" | "B-10" | "B-11" | "B-12" | "B-13" | "B-14" | "B-15" | "B-16" | "B-17" | "B-18" | "C-1" | "C-2" | "C-3" | "C-4" | "C-5" | "C-6" | "C-7" | "C-8" | "C-9" | "C-10" | "C-11" | "C-12" | "C-13" | "C-14" | "C-15" | "C-16" | "C-17" | "C-18" | "D-1" | "D-2" | "D-3" | "D-4" | "D-5" | "D-6" | "D-7" | "D-8" | "D-9" | "D-10" | "D-11" | "D-12" | "D-13" | "D-14" | "D-15" | "D-16" | "D-17" | "D-18" | "E-1" | "E-2" | "E-3" | "E-4" | "E-5" | "E-6" | "E-7" | "E-8" | "E-9" | "E-10" | "E-11" | "E-12" | "E-13" | "E-14" | "E-15" | "E-16" | "E-17" | "E-18" | "F-1" | "F-2" | "F-3" | "F-4" | "F-5" | "F-6" | "F-7" | "F-8" | "F-9" | "F-10" | "F-11" | "F-12" | "F-13" | "F-14" | "F-15" | "F-16" | "F-17" | "F-18" | "G-1" | "G-2" | "G-3" | "G-4" | "G-5" | "G-6" | "G-7" | "G-8" | "G-9" | "G-10" | "G-11" | "G-12" | "G-13" | "G-14" | "G-15" | "G-16" | "G-17" | "G-18" | "H-1" | "H-2" | "H-3" | "H-4" | "H-5" | "H-6" | "H-7" | "H-8" | "H-9" | "H-10" | "H-11" | "H-12" | "H-13" | "H-14" | "H-15" | "H-16" | "H-17" | "H-18" | "I-1" | "I-2" | "I-3" | "I-4" | "I-5" | "I-6" | "I-7" | "I-8" | "I-9" | "I-10" | "I-11" | "I-12" | "I-13" | "I-14" | "I-15" | "I-16" | "I-17" | "I-18" | "J-1" | "J-2" | "J-3" | "J-4" | "J-5" | "J-6" | "J-7" | "J-8" | "J-9" | "J-10" | "J-11" | "J-12" | "J-13" | "J-14" | "J-15" | "J-16" | "J-17" | "J-18" | "K-1" | "K-2" | "K-3" | "K-4" | "K-5" | "K-6" | "K-7" | "K-8" | "K-9" | "K-10" | "K-11" | "K-12" | "K-13" | "K-14" | "K-15" | "K-16" | "K-17" | "K-18" | "L-1" | "L-2" | "L-3" | "L-4" | "L-5" | "L-6" | "L-7" | "L-8" | "L-9" | "L-10" | "L-11" | "L-12" | "L-13" | "L-14" | "L-15" | "L-16" | "L-17" | "L-18", BoardSpace>>;
}, "strip", z.ZodTypeAny, {
    boardType: "standard";
    board: Record<"A-1" | "A-2" | "A-3" | "A-4" | "A-5" | "A-6" | "A-7" | "A-8" | "A-9" | "A-10" | "A-11" | "A-12" | "A-13" | "A-14" | "A-15" | "A-16" | "A-17" | "A-18" | "B-1" | "B-2" | "B-3" | "B-4" | "B-5" | "B-6" | "B-7" | "B-8" | "B-9" | "B-10" | "B-11" | "B-12" | "B-13" | "B-14" | "B-15" | "B-16" | "B-17" | "B-18" | "C-1" | "C-2" | "C-3" | "C-4" | "C-5" | "C-6" | "C-7" | "C-8" | "C-9" | "C-10" | "C-11" | "C-12" | "C-13" | "C-14" | "C-15" | "C-16" | "C-17" | "C-18" | "D-1" | "D-2" | "D-3" | "D-4" | "D-5" | "D-6" | "D-7" | "D-8" | "D-9" | "D-10" | "D-11" | "D-12" | "D-13" | "D-14" | "D-15" | "D-16" | "D-17" | "D-18" | "E-1" | "E-2" | "E-3" | "E-4" | "E-5" | "E-6" | "E-7" | "E-8" | "E-9" | "E-10" | "E-11" | "E-12" | "E-13" | "E-14" | "E-15" | "E-16" | "E-17" | "E-18" | "F-1" | "F-2" | "F-3" | "F-4" | "F-5" | "F-6" | "F-7" | "F-8" | "F-9" | "F-10" | "F-11" | "F-12" | "F-13" | "F-14" | "F-15" | "F-16" | "F-17" | "F-18" | "G-1" | "G-2" | "G-3" | "G-4" | "G-5" | "G-6" | "G-7" | "G-8" | "G-9" | "G-10" | "G-11" | "G-12" | "G-13" | "G-14" | "G-15" | "G-16" | "G-17" | "G-18" | "H-1" | "H-2" | "H-3" | "H-4" | "H-5" | "H-6" | "H-7" | "H-8" | "H-9" | "H-10" | "H-11" | "H-12" | "H-13" | "H-14" | "H-15" | "H-16" | "H-17" | "H-18" | "I-1" | "I-2" | "I-3" | "I-4" | "I-5" | "I-6" | "I-7" | "I-8" | "I-9" | "I-10" | "I-11" | "I-12" | "I-13" | "I-14" | "I-15" | "I-16" | "I-17" | "I-18" | "J-1" | "J-2" | "J-3" | "J-4" | "J-5" | "J-6" | "J-7" | "J-8" | "J-9" | "J-10" | "J-11" | "J-12" | "J-13" | "J-14" | "J-15" | "J-16" | "J-17" | "J-18" | "K-1" | "K-2" | "K-3" | "K-4" | "K-5" | "K-6" | "K-7" | "K-8" | "K-9" | "K-10" | "K-11" | "K-12" | "K-13" | "K-14" | "K-15" | "K-16" | "K-17" | "K-18" | "L-1" | "L-2" | "L-3" | "L-4" | "L-5" | "L-6" | "L-7" | "L-8" | "L-9" | "L-10" | "L-11" | "L-12" | "L-13" | "L-14" | "L-15" | "L-16" | "L-17" | "L-18", BoardSpace>;
}, {
    boardType: "standard";
    board: Record<"A-1" | "A-2" | "A-3" | "A-4" | "A-5" | "A-6" | "A-7" | "A-8" | "A-9" | "A-10" | "A-11" | "A-12" | "A-13" | "A-14" | "A-15" | "A-16" | "A-17" | "A-18" | "B-1" | "B-2" | "B-3" | "B-4" | "B-5" | "B-6" | "B-7" | "B-8" | "B-9" | "B-10" | "B-11" | "B-12" | "B-13" | "B-14" | "B-15" | "B-16" | "B-17" | "B-18" | "C-1" | "C-2" | "C-3" | "C-4" | "C-5" | "C-6" | "C-7" | "C-8" | "C-9" | "C-10" | "C-11" | "C-12" | "C-13" | "C-14" | "C-15" | "C-16" | "C-17" | "C-18" | "D-1" | "D-2" | "D-3" | "D-4" | "D-5" | "D-6" | "D-7" | "D-8" | "D-9" | "D-10" | "D-11" | "D-12" | "D-13" | "D-14" | "D-15" | "D-16" | "D-17" | "D-18" | "E-1" | "E-2" | "E-3" | "E-4" | "E-5" | "E-6" | "E-7" | "E-8" | "E-9" | "E-10" | "E-11" | "E-12" | "E-13" | "E-14" | "E-15" | "E-16" | "E-17" | "E-18" | "F-1" | "F-2" | "F-3" | "F-4" | "F-5" | "F-6" | "F-7" | "F-8" | "F-9" | "F-10" | "F-11" | "F-12" | "F-13" | "F-14" | "F-15" | "F-16" | "F-17" | "F-18" | "G-1" | "G-2" | "G-3" | "G-4" | "G-5" | "G-6" | "G-7" | "G-8" | "G-9" | "G-10" | "G-11" | "G-12" | "G-13" | "G-14" | "G-15" | "G-16" | "G-17" | "G-18" | "H-1" | "H-2" | "H-3" | "H-4" | "H-5" | "H-6" | "H-7" | "H-8" | "H-9" | "H-10" | "H-11" | "H-12" | "H-13" | "H-14" | "H-15" | "H-16" | "H-17" | "H-18" | "I-1" | "I-2" | "I-3" | "I-4" | "I-5" | "I-6" | "I-7" | "I-8" | "I-9" | "I-10" | "I-11" | "I-12" | "I-13" | "I-14" | "I-15" | "I-16" | "I-17" | "I-18" | "J-1" | "J-2" | "J-3" | "J-4" | "J-5" | "J-6" | "J-7" | "J-8" | "J-9" | "J-10" | "J-11" | "J-12" | "J-13" | "J-14" | "J-15" | "J-16" | "J-17" | "J-18" | "K-1" | "K-2" | "K-3" | "K-4" | "K-5" | "K-6" | "K-7" | "K-8" | "K-9" | "K-10" | "K-11" | "K-12" | "K-13" | "K-14" | "K-15" | "K-16" | "K-17" | "K-18" | "L-1" | "L-2" | "L-3" | "L-4" | "L-5" | "L-6" | "L-7" | "L-8" | "L-9" | "L-10" | "L-11" | "L-12" | "L-13" | "L-14" | "L-15" | "L-16" | "L-17" | "L-18", BoardSpace>;
}>;
/**
 * A standard board for the game.
 * A unique map of exactly 216 coordinates (A-1 through L-18), where each coordinate
 * exists exactly once (e.g., there is only one "A-11", only one "F-3", etc.).
 *
 * Coordinate system:
 * - Rows are lettered A through L (12 rows)
 * - Columns are numbered 1 through 18 (1-indexed)
 * - Example: "A-1" is the top-left space, "L-18" is the bottom-right space
 *
 * Access spaces by coordinate: `board["A-1"]`, `board["F-3"]`, etc.
 */
export interface StandardBoard {
    /**
     * The type of board.
     */
    boardType: "standard";
    /**
     * The board.
     */
    board: Record<StandardBoardCoordinate, BoardSpace>;
}
//# sourceMappingURL=standardBoard.d.ts.map