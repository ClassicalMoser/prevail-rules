import type { BoardSpace } from "../boardSpace.js";
import type { StandardBoardCoordinate } from "./standardCoordinates.js";
import { z } from "zod";
/**
 * The schema for a standard board.
 */
export declare const standardBoardSchema: z.ZodRecord<z.ZodEnum<["A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "A7" | "A8" | "A9" | "A10" | "A11" | "A12" | "A13" | "A14" | "A15" | "A16" | "A17" | "A18" | "B1" | "B2" | "B3" | "B4" | "B5" | "B6" | "B7" | "B8" | "B9" | "B10" | "B11" | "B12" | "B13" | "B14" | "B15" | "B16" | "B17" | "B18" | "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7" | "C8" | "C9" | "C10" | "C11" | "C12" | "C13" | "C14" | "C15" | "C16" | "C17" | "C18" | "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8" | "D9" | "D10" | "D11" | "D12" | "D13" | "D14" | "D15" | "D16" | "D17" | "D18" | "E1" | "E2" | "E3" | "E4" | "E5" | "E6" | "E7" | "E8" | "E9" | "E10" | "E11" | "E12" | "E13" | "E14" | "E15" | "E16" | "E17" | "E18" | "F1" | "F2" | "F3" | "F4" | "F5" | "F6" | "F7" | "F8" | "F9" | "F10" | "F11" | "F12" | "F13" | "F14" | "F15" | "F16" | "F17" | "F18" | "G1" | "G2" | "G3" | "G4" | "G5" | "G6" | "G7" | "G8" | "G9" | "G10" | "G11" | "G12" | "G13" | "G14" | "G15" | "G16" | "G17" | "G18" | "H1" | "H2" | "H3" | "H4" | "H5" | "H6" | "H7" | "H8" | "H9" | "H10" | "H11" | "H12" | "H13" | "H14" | "H15" | "H16" | "H17" | "H18" | "I1" | "I2" | "I3" | "I4" | "I5" | "I6" | "I7" | "I8" | "I9" | "I10" | "I11" | "I12" | "I13" | "I14" | "I15" | "I16" | "I17" | "I18" | "J1" | "J2" | "J3" | "J4" | "J5" | "J6" | "J7" | "J8" | "J9" | "J10" | "J11" | "J12" | "J13" | "J14" | "J15" | "J16" | "J17" | "J18" | "K1" | "K2" | "K3" | "K4" | "K5" | "K6" | "K7" | "K8" | "K9" | "K10" | "K11" | "K12" | "K13" | "K14" | "K15" | "K16" | "K17" | "K18" | "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7" | "L8" | "L9" | "L10" | "L11" | "L12" | "L13" | "L14" | "L15" | "L16" | "L17" | "L18", ...("A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "A7" | "A8" | "A9" | "A10" | "A11" | "A12" | "A13" | "A14" | "A15" | "A16" | "A17" | "A18" | "B1" | "B2" | "B3" | "B4" | "B5" | "B6" | "B7" | "B8" | "B9" | "B10" | "B11" | "B12" | "B13" | "B14" | "B15" | "B16" | "B17" | "B18" | "C1" | "C2" | "C3" | "C4" | "C5" | "C6" | "C7" | "C8" | "C9" | "C10" | "C11" | "C12" | "C13" | "C14" | "C15" | "C16" | "C17" | "C18" | "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8" | "D9" | "D10" | "D11" | "D12" | "D13" | "D14" | "D15" | "D16" | "D17" | "D18" | "E1" | "E2" | "E3" | "E4" | "E5" | "E6" | "E7" | "E8" | "E9" | "E10" | "E11" | "E12" | "E13" | "E14" | "E15" | "E16" | "E17" | "E18" | "F1" | "F2" | "F3" | "F4" | "F5" | "F6" | "F7" | "F8" | "F9" | "F10" | "F11" | "F12" | "F13" | "F14" | "F15" | "F16" | "F17" | "F18" | "G1" | "G2" | "G3" | "G4" | "G5" | "G6" | "G7" | "G8" | "G9" | "G10" | "G11" | "G12" | "G13" | "G14" | "G15" | "G16" | "G17" | "G18" | "H1" | "H2" | "H3" | "H4" | "H5" | "H6" | "H7" | "H8" | "H9" | "H10" | "H11" | "H12" | "H13" | "H14" | "H15" | "H16" | "H17" | "H18" | "I1" | "I2" | "I3" | "I4" | "I5" | "I6" | "I7" | "I8" | "I9" | "I10" | "I11" | "I12" | "I13" | "I14" | "I15" | "I16" | "I17" | "I18" | "J1" | "J2" | "J3" | "J4" | "J5" | "J6" | "J7" | "J8" | "J9" | "J10" | "J11" | "J12" | "J13" | "J14" | "J15" | "J16" | "J17" | "J18" | "K1" | "K2" | "K3" | "K4" | "K5" | "K6" | "K7" | "K8" | "K9" | "K10" | "K11" | "K12" | "K13" | "K14" | "K15" | "K16" | "K17" | "K18" | "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7" | "L8" | "L9" | "L10" | "L11" | "L12" | "L13" | "L14" | "L15" | "L16" | "L17" | "L18")[]]>, z.ZodObject<{
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
        facing: z.ZodEnum<["north", "northEast", "east", "southEast", "south", "southWest", "west", "northWest"]>;
    }, "strip", z.ZodTypeAny, {
        presenceType: "single";
        unit: {
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
        };
        facing: "north" | "northEast" | "east" | "southEast" | "south" | "southWest" | "west" | "northWest";
    }, {
        presenceType: "single";
        unit: {
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
        };
        facing: "north" | "northEast" | "east" | "southEast" | "south" | "southWest" | "west" | "northWest";
    }>, z.ZodObject<{
        presenceType: z.ZodLiteral<"engaged">;
        primaryUnit: z.ZodObject<{
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
        primaryFacing: z.ZodEnum<["north", "northEast", "east", "southEast", "south", "southWest", "west", "northWest"]>;
        secondaryUnit: z.ZodObject<{
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
    }, "strip", z.ZodTypeAny, {
        presenceType: "engaged";
        primaryUnit: {
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
        };
        primaryFacing: "north" | "northEast" | "east" | "southEast" | "south" | "southWest" | "west" | "northWest";
        secondaryUnit: {
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
        };
    }, {
        presenceType: "engaged";
        primaryUnit: {
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
        };
        primaryFacing: "north" | "northEast" | "east" | "southEast" | "south" | "southWest" | "west" | "northWest";
        secondaryUnit: {
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
        presenceType: "none";
    } | {
        presenceType: "single";
        unit: {
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
        };
        facing: "north" | "northEast" | "east" | "southEast" | "south" | "southWest" | "west" | "northWest";
    } | {
        presenceType: "engaged";
        primaryUnit: {
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
        };
        primaryFacing: "north" | "northEast" | "east" | "southEast" | "south" | "southWest" | "west" | "northWest";
        secondaryUnit: {
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
        };
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
        presenceType: "none";
    } | {
        presenceType: "single";
        unit: {
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
        };
        facing: "north" | "northEast" | "east" | "southEast" | "south" | "southWest" | "west" | "northWest";
    } | {
        presenceType: "engaged";
        primaryUnit: {
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
        };
        primaryFacing: "north" | "northEast" | "east" | "southEast" | "south" | "southWest" | "west" | "northWest";
        secondaryUnit: {
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
        };
    };
    terrainType?: "plain" | "rocks" | "scrub" | "lightForest" | "denseForest" | undefined;
}>>;
/**
 * A standard board for the game.
 * A unique map of exactly 216 coordinates (A1 through L18), where each coordinate
 * exists exactly once (e.g., there is only one "A11", only one "F3", etc.).
 *
 * Coordinate system:
 * - Rows are lettered A through L (12 rows)
 * - Columns are numbered 1 through 18 (1-indexed)
 * - Example: "A1" is the top-left space, "L18" is the bottom-right space
 *
 * Access spaces by coordinate: `board["A1"]`, `board["F3"]`, etc.
 */
export type StandardBoard = {
    [K in StandardBoardCoordinate]: BoardSpace;
};
//# sourceMappingURL=standardBoard.d.ts.map