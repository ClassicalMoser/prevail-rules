import type { UnitFacing } from "../unit/unitFacing.js";
import type { UnitInstance } from "../unit/unitInstance.js";
import { z } from "zod";
/**
 * The schema for unit presence in a space.
 */
export declare const unitPresenceSchema: z.ZodDiscriminatedUnion<
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
        /** The unit in the space. */
        unit: z.ZodObject<
          {
            instanceNumber: z.ZodNumber;
            unitType: z.ZodObject<
              {
                id: z.ZodString;
                name: z.ZodString;
                traits: z.ZodArray<
                  z.ZodEnum<
                    [
                      "formation",
                      "sword",
                      "spear",
                      "phalanx",
                      "skirmish",
                      "javelin",
                      "mounted",
                      "horse",
                    ]
                  >,
                  "many"
                >;
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
                traits: (
                  | "formation"
                  | "sword"
                  | "spear"
                  | "phalanx"
                  | "skirmish"
                  | "javelin"
                  | "mounted"
                  | "horse"
                )[];
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
                traits: (
                  | "formation"
                  | "sword"
                  | "spear"
                  | "phalanx"
                  | "skirmish"
                  | "javelin"
                  | "mounted"
                  | "horse"
                )[];
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
            unitType: {
              reverse: number;
              id: string;
              name: string;
              traits: (
                | "formation"
                | "sword"
                | "spear"
                | "phalanx"
                | "skirmish"
                | "javelin"
                | "mounted"
                | "horse"
              )[];
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
          },
          {
            unitType: {
              reverse: number;
              id: string;
              name: string;
              traits: (
                | "formation"
                | "sword"
                | "spear"
                | "phalanx"
                | "skirmish"
                | "javelin"
                | "mounted"
                | "horse"
              )[];
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
          }
        >;
        /** The facing direction of the unit. */
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
          unitType: {
            reverse: number;
            id: string;
            name: string;
            traits: (
              | "formation"
              | "sword"
              | "spear"
              | "phalanx"
              | "skirmish"
              | "javelin"
              | "mounted"
              | "horse"
            )[];
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
          unitType: {
            reverse: number;
            id: string;
            name: string;
            traits: (
              | "formation"
              | "sword"
              | "spear"
              | "phalanx"
              | "skirmish"
              | "javelin"
              | "mounted"
              | "horse"
            )[];
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
        /** The primary unit in the engagement. */
        primaryUnit: z.ZodObject<
          {
            instanceNumber: z.ZodNumber;
            unitType: z.ZodObject<
              {
                id: z.ZodString;
                name: z.ZodString;
                traits: z.ZodArray<
                  z.ZodEnum<
                    [
                      "formation",
                      "sword",
                      "spear",
                      "phalanx",
                      "skirmish",
                      "javelin",
                      "mounted",
                      "horse",
                    ]
                  >,
                  "many"
                >;
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
                traits: (
                  | "formation"
                  | "sword"
                  | "spear"
                  | "phalanx"
                  | "skirmish"
                  | "javelin"
                  | "mounted"
                  | "horse"
                )[];
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
                traits: (
                  | "formation"
                  | "sword"
                  | "spear"
                  | "phalanx"
                  | "skirmish"
                  | "javelin"
                  | "mounted"
                  | "horse"
                )[];
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
            unitType: {
              reverse: number;
              id: string;
              name: string;
              traits: (
                | "formation"
                | "sword"
                | "spear"
                | "phalanx"
                | "skirmish"
                | "javelin"
                | "mounted"
                | "horse"
              )[];
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
          },
          {
            unitType: {
              reverse: number;
              id: string;
              name: string;
              traits: (
                | "formation"
                | "sword"
                | "spear"
                | "phalanx"
                | "skirmish"
                | "javelin"
                | "mounted"
                | "horse"
              )[];
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
          }
        >;
        /** The facing direction of the primary unit. */
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
        /** The secondary unit in the engagement (facing opposite the primary unit). */
        secondaryUnit: z.ZodObject<
          {
            instanceNumber: z.ZodNumber;
            unitType: z.ZodObject<
              {
                id: z.ZodString;
                name: z.ZodString;
                traits: z.ZodArray<
                  z.ZodEnum<
                    [
                      "formation",
                      "sword",
                      "spear",
                      "phalanx",
                      "skirmish",
                      "javelin",
                      "mounted",
                      "horse",
                    ]
                  >,
                  "many"
                >;
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
                traits: (
                  | "formation"
                  | "sword"
                  | "spear"
                  | "phalanx"
                  | "skirmish"
                  | "javelin"
                  | "mounted"
                  | "horse"
                )[];
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
                traits: (
                  | "formation"
                  | "sword"
                  | "spear"
                  | "phalanx"
                  | "skirmish"
                  | "javelin"
                  | "mounted"
                  | "horse"
                )[];
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
            unitType: {
              reverse: number;
              id: string;
              name: string;
              traits: (
                | "formation"
                | "sword"
                | "spear"
                | "phalanx"
                | "skirmish"
                | "javelin"
                | "mounted"
                | "horse"
              )[];
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
          },
          {
            unitType: {
              reverse: number;
              id: string;
              name: string;
              traits: (
                | "formation"
                | "sword"
                | "spear"
                | "phalanx"
                | "skirmish"
                | "javelin"
                | "mounted"
                | "horse"
              )[];
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
          }
        >;
      },
      "strip",
      z.ZodTypeAny,
      {
        presenceType: "engaged";
        primaryUnit: {
          unitType: {
            reverse: number;
            id: string;
            name: string;
            traits: (
              | "formation"
              | "sword"
              | "spear"
              | "phalanx"
              | "skirmish"
              | "javelin"
              | "mounted"
              | "horse"
            )[];
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
          unitType: {
            reverse: number;
            id: string;
            name: string;
            traits: (
              | "formation"
              | "sword"
              | "spear"
              | "phalanx"
              | "skirmish"
              | "javelin"
              | "mounted"
              | "horse"
            )[];
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
      },
      {
        presenceType: "engaged";
        primaryUnit: {
          unitType: {
            reverse: number;
            id: string;
            name: string;
            traits: (
              | "formation"
              | "sword"
              | "spear"
              | "phalanx"
              | "skirmish"
              | "javelin"
              | "mounted"
              | "horse"
            )[];
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
          unitType: {
            reverse: number;
            id: string;
            name: string;
            traits: (
              | "formation"
              | "sword"
              | "spear"
              | "phalanx"
              | "skirmish"
              | "javelin"
              | "mounted"
              | "horse"
            )[];
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
      }
    >,
  ]
>;
/**
 * Unit presence in a space.
 */
export type UnitPresence =
  | {
      /** No unit is present in the space. */
      presenceType: "none";
    }
  | {
      /** A single unit is present in the space. */
      presenceType: "single";
      /** The unit in the space. */
      unit: UnitInstance;
      /** The facing direction of the unit. */
      facing: UnitFacing;
    }
  | {
      /** Two units are engaged in combat in the space. */
      presenceType: "engaged";
      /** The primary unit in the engagement. */
      primaryUnit: UnitInstance;
      /** The facing direction of the primary unit. */
      primaryFacing: UnitFacing;
      /** The secondary unit in the engagement (facing opposite the primary unit). */
      secondaryUnit: UnitInstance;
    };
//# sourceMappingURL=unitPresence.d.ts.map
