import type { AssertExact } from '@utils';
import { z } from 'zod';

/**
 * The schema for the elevation of a space.
 */
export const elevationSchema: z.ZodType<Elevation> = z.object({
  /**
   * The elevation of the north-west corner of the space.
   */
  northWest: z.number().min(0).max(5).default(0),
  /**
   * The elevation of the north-east corner of the space.
   */
  northEast: z.number().min(0).max(5).default(0),
  /**
   * The elevation of the south-west corner of the space.
   */
  southWest: z.number().min(0).max(5).default(0),
  /**
   * The elevation of the south-east corner of the space.
   */
  southEast: z.number().min(0).max(5).default(0),
});

// Helper type to check match of type against schema
type elevationSchemaType = z.infer<typeof elevationSchema>;

/**
 * The elevation of each corner of a space.
 */
export interface Elevation {
  /**
   * The elevation of the north-west corner of the space.
   */
  northWest: number;
  /**
   * The elevation of the north-east corner of the space.
   */
  northEast: number;
  /**
   * The elevation of the south-west corner of the space.
   */
  southWest: number;
  /**
   * The elevation of the south-east corner of the space.
   */
  southEast: number;
}

const _assertExactElevation: AssertExact<Elevation, elevationSchemaType> = true;
