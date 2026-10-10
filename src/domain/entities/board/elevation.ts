/**
 * Corner heights for a board space.
 *
 * Elevation is not a single number on the space: each of the four corners
 * has its own integer height. Queries that care about slopes, LOS, or
 * cresting read these corners rather than a flat “space elevation” field.
 * Range is 0–5 (inclusive); Zod defaults missing corners to `0`.
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
     * Height of the north-west corner (0–5; default 0).
     */
    northWest: z.int().min(0).max(5).default(0),
    /**
     * Height of the north-east corner (0–5; default 0).
     */
    northEast: z.int().min(0).max(5).default(0),
    /**
     * Height of the south-west corner (0–5; default 0).
     */
    southWest: z.int().min(0).max(5).default(0),
    /**
     * Height of the south-east corner (0–5; default 0).
     */
    southEast: z.int().min(0).max(5).default(0),
  })
  .strict();

type elevationSchemaType = z.infer<typeof _elevationSchemaObject>;

/**
 * Zod schema for space-corner elevations.
 * Integers 0–5; each corner defaults to 0 when omitted at parse time.
 */
export const elevationSchema: z.ZodType<Elevation> = _elevationSchemaObject;

// Verify manual type matches schema inference
const _assertExactElevation: AssertExact<Elevation, elevationSchemaType> = true;
