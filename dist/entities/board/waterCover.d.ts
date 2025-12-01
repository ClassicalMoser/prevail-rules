import { z } from "zod";
/**
 * The schema for the water cover of a space.
 */
export declare const waterCoverSchema: z.ZodObject<{
    /**
     * Whether the space is covered by water from the north.
     */
    north: z.ZodDefault<z.ZodBoolean>;
    /**
     * Whether the space is covered by water from the north-east.
     */
    northEast: z.ZodDefault<z.ZodBoolean>;
    /**
     * Whether the space is covered by water from the east.
     */
    east: z.ZodDefault<z.ZodBoolean>;
    /**
     * Whether the space is covered by water from the south-east.
     */
    southEast: z.ZodDefault<z.ZodBoolean>;
    /**
     * Whether the space is covered by water from the south.
     */
    south: z.ZodDefault<z.ZodBoolean>;
    /**
     * Whether the space is covered by water from the south-west.
     */
    southWest: z.ZodDefault<z.ZodBoolean>;
    /**
     * Whether the space is covered by water from the west.
     */
    west: z.ZodDefault<z.ZodBoolean>;
    /**
     * Whether the space is covered by water from the north-west.
     */
    northWest: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    north: boolean;
    east: boolean;
    south: boolean;
    west: boolean;
    northEast: boolean;
    southEast: boolean;
    southWest: boolean;
    northWest: boolean;
}, {
    north?: boolean | undefined;
    east?: boolean | undefined;
    south?: boolean | undefined;
    west?: boolean | undefined;
    northEast?: boolean | undefined;
    southEast?: boolean | undefined;
    southWest?: boolean | undefined;
    northWest?: boolean | undefined;
}>;
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
//# sourceMappingURL=waterCover.d.ts.map