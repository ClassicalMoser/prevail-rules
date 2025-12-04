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
 * The type of terrain in a space.
 * Terrain focuses on ground cover. Elevation and water cover are handled separately.
 */
export type TerrainType = (typeof terrainTypes)[number];

const _terrainTypeSchemaObject = z
  .enum(terrainTypes)
  .default(terrainTypes[0]);
type terrainTypeSchemaType = z.infer<typeof _terrainTypeSchemaObject>;

/**
 * The schema for the type of terrain in a space.
 * Terrain focuses on ground cover. Elevation and water cover are handled separately.
 */
export const terrainTypeSchema: z.ZodType<TerrainType> = _terrainTypeSchemaObject;

// Verify manual type matches schema inference
const _assertExactTerrainType: AssertExact<TerrainType, terrainTypeSchemaType> =
  true;
