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
const _assertExactWaterCover = true;
