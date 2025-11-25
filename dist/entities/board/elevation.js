import { z } from "zod";
/**
 * The schema for the elevation of a space.
 */
export const elevationSchema = z.object({
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
const _assertExactElevation = true;
