/**
 * Ground-cover vocabulary for a board space.
 *
 * Terrain here is only surface type (plain, rocks, scrub, forest). Elevation
 * and water are modeled on {@link BoardSpace} as separate fields so movement,
 * LOS, and cover rules can combine them without overloading a single enum.
 * The Zod schema defaults omitted terrain to `'plain'`.
 */

import type { AssertExact } from '@utils';
import { z } from 'zod';

/**
 * Closed list of valid terrain type literals.
 * Order is not a game rule; first entry (`plain`) is the schema default.
 */
const terrainTypes = [
  'plain',
  'rocks',
  'scrub',
  'lightForest',
  'denseForest',
] as const;

/**
 * Ground cover in a space.
 *
 * Does not encode elevation or water — those live on {@link Elevation} and
 * {@link WaterCover}. Factories and empty-board builders typically start from
 * `'plain'`.
 */
export type TerrainType = (typeof terrainTypes)[number];

const _terrainTypeSchemaObject = z.enum(terrainTypes).default(terrainTypes[0]);
type terrainTypeSchemaType = z.infer<typeof _terrainTypeSchemaObject>;

/**
 * Zod schema for terrain type.
 * Defaults to `'plain'` when the field is omitted at parse time.
 */
export const terrainTypeSchema: z.ZodType<TerrainType> =
  _terrainTypeSchemaObject;

// Verify manual type matches schema inference
const _assertExactTerrainType: AssertExact<TerrainType, terrainTypeSchemaType> =
  true;
