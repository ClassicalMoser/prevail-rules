import type { UnitPresence } from "../unit/unitPresence.js";
import type { Elevation } from "./elevation.js";
import type { TerrainType } from "./terrainTypes.js";
import type { WaterCover } from "./waterCover.js";
import { z } from "zod";
/**
 * The schema for a space of the game board.
 */
export declare const boardSpaceSchema: z.ZodObject<
  {
    /**
     * The type of terrain in the space.
     */
    terrainType: z.ZodDefault<
      z.ZodEnum<["plain", "rocks", "scrub", "lightForest", "denseForest"]>
    >;
    /**
     * The elevation of the space.
     */
    elevation: z.ZodObject<
      {
        northWest: z.ZodDefault<z.ZodNumber>;
        northEast: z.ZodDefault<z.ZodNumber>;
        southWest: z.ZodDefault<z.ZodNumber>;
        southEast: z.ZodDefault<z.ZodNumber>;
      },
      "strip",
      z.ZodTypeAny,
      {
        northEast: number;
        southEast: number;
        southWest: number;
        northWest: number;
      },
      {
        northEast?: number | undefined;
        southEast?: number | undefined;
        southWest?: number | undefined;
        northWest?: number | undefined;
      }
    >;
    /**
     * The water cover of the space.
     */
    waterCover: z.ZodObject<
      {
        north: z.ZodDefault<z.ZodBoolean>;
        northEast: z.ZodDefault<z.ZodBoolean>;
        east: z.ZodDefault<z.ZodBoolean>;
        southEast: z.ZodDefault<z.ZodBoolean>;
        south: z.ZodDefault<z.ZodBoolean>;
        southWest: z.ZodDefault<z.ZodBoolean>;
        west: z.ZodDefault<z.ZodBoolean>;
        northWest: z.ZodDefault<z.ZodBoolean>;
      },
      "strip",
      z.ZodTypeAny,
      {
        north: boolean;
        northEast: boolean;
        east: boolean;
        southEast: boolean;
        south: boolean;
        southWest: boolean;
        west: boolean;
        northWest: boolean;
      },
      {
        north?: boolean | undefined;
        northEast?: boolean | undefined;
        east?: boolean | undefined;
        southEast?: boolean | undefined;
        south?: boolean | undefined;
        southWest?: boolean | undefined;
        west?: boolean | undefined;
        northWest?: boolean | undefined;
      }
    >;
    /**
     * The unit presence in the space.
     */
    unitPresence: z.ZodDiscriminatedUnion<
      "presenceType",
      [
        z.ZodObject<
          {
            presenceType: z.ZodLiteral<"none">;
          },
          "strip",
          z.ZodTypeAny,
          {
            presenceType: "none";
          },
          {
            presenceType: "none";
          }
        >,
        z.ZodObject<
          {
            presenceType: z.ZodLiteral<"single">;
            unit: z.ZodObject<
              {
                instanceNumber: z.ZodNumber;
                unitType: z.ZodObject<
                  {
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
                  },
                  "strip",
                  z.ZodTypeAny,
                  {
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
                  },
                  {
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
                  }
                >;
              },
              "strip",
              z.ZodTypeAny,
              {
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
              },
              {
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
              }
            >;
            facing: z.ZodEnum<
              [
                "north",
                "northEast",
                "east",
                "southEast",
                "south",
                "southWest",
                "west",
                "northWest",
              ]
            >;
          },
          "strip",
          z.ZodTypeAny,
          {
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
            facing:
              | "north"
              | "northEast"
              | "east"
              | "southEast"
              | "south"
              | "southWest"
              | "west"
              | "northWest";
          },
          {
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
            facing:
              | "north"
              | "northEast"
              | "east"
              | "southEast"
              | "south"
              | "southWest"
              | "west"
              | "northWest";
          }
        >,
        z.ZodObject<
          {
            presenceType: z.ZodLiteral<"engaged">;
            primaryUnit: z.ZodObject<
              {
                instanceNumber: z.ZodNumber;
                unitType: z.ZodObject<
                  {
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
                  },
                  "strip",
                  z.ZodTypeAny,
                  {
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
                  },
                  {
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
                  }
                >;
              },
              "strip",
              z.ZodTypeAny,
              {
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
              },
              {
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
              }
            >;
            primaryFacing: z.ZodEnum<
              [
                "north",
                "northEast",
                "east",
                "southEast",
                "south",
                "southWest",
                "west",
                "northWest",
              ]
            >;
            secondaryUnit: z.ZodObject<
              {
                instanceNumber: z.ZodNumber;
                unitType: z.ZodObject<
                  {
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
                  },
                  "strip",
                  z.ZodTypeAny,
                  {
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
                  },
                  {
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
                  }
                >;
              },
              "strip",
              z.ZodTypeAny,
              {
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
              },
              {
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
              }
            >;
          },
          "strip",
          z.ZodTypeAny,
          {
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
            primaryFacing:
              | "north"
              | "northEast"
              | "east"
              | "southEast"
              | "south"
              | "southWest"
              | "west"
              | "northWest";
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
          },
          {
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
            primaryFacing:
              | "north"
              | "northEast"
              | "east"
              | "southEast"
              | "south"
              | "southWest"
              | "west"
              | "northWest";
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
          }
        >,
      ]
    >;
  },
  "strip",
  z.ZodTypeAny,
  {
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
    unitPresence:
      | {
          presenceType: "none";
        }
      | {
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
          facing:
            | "north"
            | "northEast"
            | "east"
            | "southEast"
            | "south"
            | "southWest"
            | "west"
            | "northWest";
        }
      | {
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
          primaryFacing:
            | "north"
            | "northEast"
            | "east"
            | "southEast"
            | "south"
            | "southWest"
            | "west"
            | "northWest";
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
  },
  {
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
    unitPresence:
      | {
          presenceType: "none";
        }
      | {
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
          facing:
            | "north"
            | "northEast"
            | "east"
            | "southEast"
            | "south"
            | "southWest"
            | "west"
            | "northWest";
        }
      | {
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
          primaryFacing:
            | "north"
            | "northEast"
            | "east"
            | "southEast"
            | "south"
            | "southWest"
            | "west"
            | "northWest";
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
    terrainType?:
      | "plain"
      | "rocks"
      | "scrub"
      | "lightForest"
      | "denseForest"
      | undefined;
  }
>;
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
}
//# sourceMappingURL=boardSpace.d.ts.map
