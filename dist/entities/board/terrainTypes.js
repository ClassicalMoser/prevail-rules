import { z } from "zod";
/**
 * List of valid terrain types.
 */
const terrainTypes = [
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
export const terrainTypeSchema = z.enum(terrainTypes).default(terrainTypes[0]);
const _assertExactTerrainType = true;
