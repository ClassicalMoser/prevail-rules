import type { AssertExact } from "@utils/assertExact.js";
import { z } from "zod";

/**
 * The schema for the water cover of a space.
 */
export const waterCoverSchema = z.object({
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

// Helper type to check match of type against schema
type waterCoverSchemaType = z.infer<typeof waterCoverSchema>;

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

const _assertExactWaterCover: AssertExact<WaterCover, waterCoverSchemaType> =
  true;
