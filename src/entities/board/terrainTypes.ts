import type { AssertExact } from '@utils';
import { z } from 'zod';

/**
 * List of valid terrain types.
 */
const terrainTypes = [
  'plain',
  'rocks',
  'scrub',
  'lightForest',
  'denseForest',
] as const;

/**
 * The schema for the type of terrain in a space.
 * Terrain focuses on ground cover. Elevation and water cover are handled separately.
 */
export const terrainTypeSchema: z.ZodType<TerrainType> = z
  .enum(terrainTypes)
  .default(terrainTypes[0]);

// Helper type to check match of type against schema
type terrainTypeSchemaType = z.infer<typeof terrainTypeSchema>;

/**
 * The type of terrain in a space.
 * Terrain focuses on ground cover. Elevation and water cover are handled separately.
 */
export type TerrainType = (typeof terrainTypes)[number];

const _assertExactTerrainType: AssertExact<TerrainType, terrainTypeSchemaType> =
  true;
