/**
 * Per-edge water flags for a board space.
 *
 * Water is not a terrain type: a space can be plain (or forest, etc.) and
 * still have water on some edges. The eight booleans match the eight
 * orthogonal and diagonal directions from the space. Queries that care about
 * fording, blocking, or coastal edges read these flags. Zod defaults each
 * edge to `false` (dry).
 */

import type { AssertExact } from '@utils';
import { z } from 'zod';

/**
 * Whether each edge of the space is covered by water.
 *
 * Directions are named from the space outward (N, NE, E, …). `true` means
 * that edge is water; `false` means dry. Independent of {@link TerrainType}
 * and {@link Elevation}.
 */
export interface WaterCover {
  /**
   * Water on the north edge of the space.
   */
  north: boolean;
  /**
   * Water on the north-east edge of the space.
   */
  northEast: boolean;
  /**
   * Water on the east edge of the space.
   */
  east: boolean;
  /**
   * Water on the south-east edge of the space.
   */
  southEast: boolean;
  /**
   * Water on the south edge of the space.
   */
  south: boolean;
  /**
   * Water on the south-west edge of the space.
   */
  southWest: boolean;
  /**
   * Water on the west edge of the space.
   */
  west: boolean;
  /**
   * Water on the north-west edge of the space.
   */
  northWest: boolean;
}

const _waterCoverSchemaObject = z
  .object({
    /**
     * Water on the north edge (default false).
     */
    north: z.boolean().default(false),
    /**
     * Water on the north-east edge (default false).
     */
    northEast: z.boolean().default(false),
    /**
     * Water on the east edge (default false).
     */
    east: z.boolean().default(false),
    /**
     * Water on the south-east edge (default false).
     */
    southEast: z.boolean().default(false),
    /**
     * Water on the south edge (default false).
     */
    south: z.boolean().default(false),
    /**
     * Water on the south-west edge (default false).
     */
    southWest: z.boolean().default(false),
    /**
     * Water on the west edge (default false).
     */
    west: z.boolean().default(false),
    /**
     * Water on the north-west edge (default false).
     */
    northWest: z.boolean().default(false),
  })
  .strict();

type waterCoverSchemaType = z.infer<typeof _waterCoverSchemaObject>;

/**
 * Zod schema for per-edge water cover.
 * Each edge defaults to dry (`false`) when omitted at parse time.
 */
export const waterCoverSchema: z.ZodType<WaterCover> = _waterCoverSchemaObject;

// Verify manual type matches schema inference
const _assertExactWaterCover: AssertExact<WaterCover, waterCoverSchemaType> =
  true;
