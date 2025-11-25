import { z } from "zod";
/**
 * List of valid facing directions for a unit.
 */
export declare const unitFacings: readonly [
  "north",
  "northEast",
  "east",
  "southEast",
  "south",
  "southWest",
  "west",
  "northWest",
];
/**
 * The schema for the facing direction of a unit.
 */
export declare const unitFacingSchema: z.ZodEnum<
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
/**
 * The facing direction of a unit.
 */
export type UnitFacing = (typeof unitFacings)[number];
//# sourceMappingURL=unitFacing.d.ts.map
