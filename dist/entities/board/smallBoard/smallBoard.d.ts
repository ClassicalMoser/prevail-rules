import type { BoardSpace } from "../boardSpace.js";
import type { SmallBoardCoordinate } from "./smallCoordinates.js";
import { z } from "zod";
/**
 * The schema for a small board.
 */
export declare const smallBoardSchema: z.ZodObject<
  {
    boardType: z.ZodLiteral<"small">;
    board: z.ZodRecord<
      z.ZodEnum<
        [
          (
            | "A-1"
            | "A-2"
            | "A-3"
            | "A-4"
            | "A-5"
            | "A-6"
            | "A-7"
            | "A-8"
            | "A-9"
            | "A-10"
            | "A-11"
            | "A-12"
            | "B-1"
            | "B-2"
            | "B-3"
            | "B-4"
            | "B-5"
            | "B-6"
            | "B-7"
            | "B-8"
            | "B-9"
            | "B-10"
            | "B-11"
            | "B-12"
            | "C-1"
            | "C-2"
            | "C-3"
            | "C-4"
            | "C-5"
            | "C-6"
            | "C-7"
            | "C-8"
            | "C-9"
            | "C-10"
            | "C-11"
            | "C-12"
            | "D-1"
            | "D-2"
            | "D-3"
            | "D-4"
            | "D-5"
            | "D-6"
            | "D-7"
            | "D-8"
            | "D-9"
            | "D-10"
            | "D-11"
            | "D-12"
            | "E-1"
            | "E-2"
            | "E-3"
            | "E-4"
            | "E-5"
            | "E-6"
            | "E-7"
            | "E-8"
            | "E-9"
            | "E-10"
            | "E-11"
            | "E-12"
            | "F-1"
            | "F-2"
            | "F-3"
            | "F-4"
            | "F-5"
            | "F-6"
            | "F-7"
            | "F-8"
            | "F-9"
            | "F-10"
            | "F-11"
            | "F-12"
            | "G-1"
            | "G-2"
            | "G-3"
            | "G-4"
            | "G-5"
            | "G-6"
            | "G-7"
            | "G-8"
            | "G-9"
            | "G-10"
            | "G-11"
            | "G-12"
            | "H-1"
            | "H-2"
            | "H-3"
            | "H-4"
            | "H-5"
            | "H-6"
            | "H-7"
            | "H-8"
            | "H-9"
            | "H-10"
            | "H-11"
            | "H-12"
          ),
          ...(
            | "A-1"
            | "A-2"
            | "A-3"
            | "A-4"
            | "A-5"
            | "A-6"
            | "A-7"
            | "A-8"
            | "A-9"
            | "A-10"
            | "A-11"
            | "A-12"
            | "B-1"
            | "B-2"
            | "B-3"
            | "B-4"
            | "B-5"
            | "B-6"
            | "B-7"
            | "B-8"
            | "B-9"
            | "B-10"
            | "B-11"
            | "B-12"
            | "C-1"
            | "C-2"
            | "C-3"
            | "C-4"
            | "C-5"
            | "C-6"
            | "C-7"
            | "C-8"
            | "C-9"
            | "C-10"
            | "C-11"
            | "C-12"
            | "D-1"
            | "D-2"
            | "D-3"
            | "D-4"
            | "D-5"
            | "D-6"
            | "D-7"
            | "D-8"
            | "D-9"
            | "D-10"
            | "D-11"
            | "D-12"
            | "E-1"
            | "E-2"
            | "E-3"
            | "E-4"
            | "E-5"
            | "E-6"
            | "E-7"
            | "E-8"
            | "E-9"
            | "E-10"
            | "E-11"
            | "E-12"
            | "F-1"
            | "F-2"
            | "F-3"
            | "F-4"
            | "F-5"
            | "F-6"
            | "F-7"
            | "F-8"
            | "F-9"
            | "F-10"
            | "F-11"
            | "F-12"
            | "G-1"
            | "G-2"
            | "G-3"
            | "G-4"
            | "G-5"
            | "G-6"
            | "G-7"
            | "G-8"
            | "G-9"
            | "G-10"
            | "G-11"
            | "G-12"
            | "H-1"
            | "H-2"
            | "H-3"
            | "H-4"
            | "H-5"
            | "H-6"
            | "H-7"
            | "H-8"
            | "H-9"
            | "H-10"
            | "H-11"
            | "H-12"
          )[],
        ]
      >,
      z.ZodObject<
        {
          terrainType: z.ZodDefault<
            z.ZodEnum<["plain", "rocks", "scrub", "lightForest", "denseForest"]>
          >;
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
          terrainType:
            | "plain"
            | "rocks"
            | "scrub"
            | "lightForest"
            | "denseForest";
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
      >
    >;
  },
  "strip",
  z.ZodTypeAny,
  {
    boardType: "small";
    board: Partial<
      Record<
        | "A-1"
        | "A-2"
        | "A-3"
        | "A-4"
        | "A-5"
        | "A-6"
        | "A-7"
        | "A-8"
        | "A-9"
        | "A-10"
        | "A-11"
        | "A-12"
        | "B-1"
        | "B-2"
        | "B-3"
        | "B-4"
        | "B-5"
        | "B-6"
        | "B-7"
        | "B-8"
        | "B-9"
        | "B-10"
        | "B-11"
        | "B-12"
        | "C-1"
        | "C-2"
        | "C-3"
        | "C-4"
        | "C-5"
        | "C-6"
        | "C-7"
        | "C-8"
        | "C-9"
        | "C-10"
        | "C-11"
        | "C-12"
        | "D-1"
        | "D-2"
        | "D-3"
        | "D-4"
        | "D-5"
        | "D-6"
        | "D-7"
        | "D-8"
        | "D-9"
        | "D-10"
        | "D-11"
        | "D-12"
        | "E-1"
        | "E-2"
        | "E-3"
        | "E-4"
        | "E-5"
        | "E-6"
        | "E-7"
        | "E-8"
        | "E-9"
        | "E-10"
        | "E-11"
        | "E-12"
        | "F-1"
        | "F-2"
        | "F-3"
        | "F-4"
        | "F-5"
        | "F-6"
        | "F-7"
        | "F-8"
        | "F-9"
        | "F-10"
        | "F-11"
        | "F-12"
        | "G-1"
        | "G-2"
        | "G-3"
        | "G-4"
        | "G-5"
        | "G-6"
        | "G-7"
        | "G-8"
        | "G-9"
        | "G-10"
        | "G-11"
        | "G-12"
        | "H-1"
        | "H-2"
        | "H-3"
        | "H-4"
        | "H-5"
        | "H-6"
        | "H-7"
        | "H-8"
        | "H-9"
        | "H-10"
        | "H-11"
        | "H-12",
        {
          terrainType:
            | "plain"
            | "rocks"
            | "scrub"
            | "lightForest"
            | "denseForest";
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
        }
      >
    >;
  },
  {
    boardType: "small";
    board: Partial<
      Record<
        | "A-1"
        | "A-2"
        | "A-3"
        | "A-4"
        | "A-5"
        | "A-6"
        | "A-7"
        | "A-8"
        | "A-9"
        | "A-10"
        | "A-11"
        | "A-12"
        | "B-1"
        | "B-2"
        | "B-3"
        | "B-4"
        | "B-5"
        | "B-6"
        | "B-7"
        | "B-8"
        | "B-9"
        | "B-10"
        | "B-11"
        | "B-12"
        | "C-1"
        | "C-2"
        | "C-3"
        | "C-4"
        | "C-5"
        | "C-6"
        | "C-7"
        | "C-8"
        | "C-9"
        | "C-10"
        | "C-11"
        | "C-12"
        | "D-1"
        | "D-2"
        | "D-3"
        | "D-4"
        | "D-5"
        | "D-6"
        | "D-7"
        | "D-8"
        | "D-9"
        | "D-10"
        | "D-11"
        | "D-12"
        | "E-1"
        | "E-2"
        | "E-3"
        | "E-4"
        | "E-5"
        | "E-6"
        | "E-7"
        | "E-8"
        | "E-9"
        | "E-10"
        | "E-11"
        | "E-12"
        | "F-1"
        | "F-2"
        | "F-3"
        | "F-4"
        | "F-5"
        | "F-6"
        | "F-7"
        | "F-8"
        | "F-9"
        | "F-10"
        | "F-11"
        | "F-12"
        | "G-1"
        | "G-2"
        | "G-3"
        | "G-4"
        | "G-5"
        | "G-6"
        | "G-7"
        | "G-8"
        | "G-9"
        | "G-10"
        | "G-11"
        | "G-12"
        | "H-1"
        | "H-2"
        | "H-3"
        | "H-4"
        | "H-5"
        | "H-6"
        | "H-7"
        | "H-8"
        | "H-9"
        | "H-10"
        | "H-11"
        | "H-12",
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
      >
    >;
  }
>;
/**
 * A small board for the game.
 * A unique map of exactly 96 coordinates (A-1 through H-12), where each coordinate
 * exists exactly once (e.g., there is only one "A-11", only one "F-3", etc.).
 *
 * Coordinate system:
 * - Rows are lettered A through H (8 rows)
 * - Columns are numbered 1 through 12 (1-indexed)
 * - Example: "A-1" is the top-left space, "H-12" is the bottom-right space
 *
 * Access spaces by coordinate: `board["A-1"]`, `board["F-3"]`, etc.
 */
export interface SmallBoard {
  /**
   * The type of board.
   */
  boardType: "small";
  /**
   * The board.
   */
  board: Record<SmallBoardCoordinate, BoardSpace>;
}
//# sourceMappingURL=smallBoard.d.ts.map
