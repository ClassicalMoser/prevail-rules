/**
 * Corner heights for a board space.
 *
 * Elevation is not a single number on the space: each of the four corners
 * has its own integer height. Queries that care about slopes, LOS, or
 * cresting read these corners rather than a flat “space elevation” field.
 * Range is -1 for low ground or water, or +1 for high ground;
 */

import type { AssertExact } from '@utils';
import { z } from 'zod';

/**
 * Elevation of each corner of a space.
 *
 * Corners are named by compass from the space’s center. Values are small
 * non-negative integers; the schema clamps the allowed range.
 */
export interface Elevation {
  /**
   * Height of the north-west corner of the space.
   */
  northWest: number;
  /**
   * Height of the north-east corner of the space.
   */
  northEast: number;
  /**
   * Height of the south-west corner of the space.
   */
  southWest: number;
  /**
   * Height of the south-east corner of the space.
   */
  southEast: number;
}

const _elevationSchemaObject = z
  .object({
    /**
     * Height of the north-west corner.
     */
    northWest: z.int().min(-1).max(1),
    /**
     * Height of the north-east corner.
     */
    northEast: z.int().min(-1).max(1),
    /**
     * Height of the south-west corner.
     */
    southWest: z.int().min(-1).max(1),
    /**
     * Height of the south-east corner.
     */
    southEast: z.int().min(-1).max(1),
  })
  .strict();

type elevationSchemaType = z.infer<typeof _elevationSchemaObject>;

/**
 * Zod schema for space-corner elevations.
 */
export const elevationSchema: z.ZodType<Elevation> = _elevationSchemaObject;

// Verify manual type matches schema inference
const _assertExactElevation: AssertExact<Elevation, elevationSchemaType> = true;
