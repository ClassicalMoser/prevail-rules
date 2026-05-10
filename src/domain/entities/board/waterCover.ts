import type { AssertExact } from '@utils';
import { z } from 'zod';

/**
 * Whether the space is covered by water.
 */
export interface WaterCover {
  /**
   * Whether the space is covered by water from the north.
   */
  north: boolean;
  /**
   * Whether the space is covered by water from the north-east.
   */
  northEast: boolean;
  /**
   * Whether the space is covered by water from the east.
   */
  east: boolean;
  /**
   * Whether the space is covered by water from the south-east.
   */
  southEast: boolean;
  /**
   * Whether the space is covered by water from the south.
   */
  south: boolean;
  /**
   * Whether the space is covered by water from the south-west.
   */
  southWest: boolean;
  /**
   * Whether the space is covered by water from the west.
   */
  west: boolean;
  /**
   * Whether the space is covered by water from the north-west.
   */
  northWest: boolean;
}

const _waterCoverSchemaObject = z.object({
  /**
   * Whether the space is covered by water from the north.
   */
  north: z.boolean().default(false),
  /**
   * Whether the space is covered by water from the north-east.
   */
  northEast: z.boolean().default(false),
  /**
   * Whether the space is covered by water from the east.
   */
  east: z.boolean().default(false),
  /**
   * Whether the space is covered by water from the south-east.
   */
  southEast: z.boolean().default(false),
  /**
   * Whether the space is covered by water from the south.
   */
  south: z.boolean().default(false),
  /**
   * Whether the space is covered by water from the south-west.
   */
  southWest: z.boolean().default(false),
  /**
   * Whether the space is covered by water from the west.
   */
  west: z.boolean().default(false),
  /**
   * Whether the space is covered by water from the north-west.
   */
  northWest: z.boolean().default(false),
});

type waterCoverSchemaType = z.infer<typeof _waterCoverSchemaObject>;

/**
 * The schema for the water cover of a space.
 */
export const waterCoverSchema: z.ZodType<WaterCover> = _waterCoverSchemaObject;

// Verify manual type matches schema inference
const _assertExactWaterCover: AssertExact<WaterCover, waterCoverSchemaType> =
  true;
