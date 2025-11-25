import { z } from "zod";
/**
 * List of valid terrain types.
 */
declare const terrainTypes: readonly [
  "plain",
  "rocks",
  "scrub",
  "lightForest",
  "denseForest",
];
/**
 * The schema for the type of terrain in a space.
 * Terrain focuses on ground cover. Elevation and water cover are handled separately.
 */
export declare const terrainTypeSchema: z.ZodDefault<
  z.ZodEnum<["plain", "rocks", "scrub", "lightForest", "denseForest"]>
>;
/**
 * The type of terrain in a space.
 * Terrain focuses on ground cover. Elevation and water cover are handled separately.
 */
export type TerrainType = (typeof terrainTypes)[number];
export {};
//# sourceMappingURL=terrainTypes.d.ts.map
