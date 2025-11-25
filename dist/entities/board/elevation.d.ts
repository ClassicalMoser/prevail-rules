import { z } from "zod";
/**
 * The schema for the elevation of a space.
 */
export declare const elevationSchema: z.ZodObject<{
    /**
     * The elevation of the north-west corner of the space.
     */
    northWest: z.ZodDefault<z.ZodNumber>;
    /**
     * The elevation of the north-east corner of the space.
     */
    northEast: z.ZodDefault<z.ZodNumber>;
    /**
     * The elevation of the south-west corner of the space.
     */
    southWest: z.ZodDefault<z.ZodNumber>;
    /**
     * The elevation of the south-east corner of the space.
     */
    southEast: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    northEast: number;
    southEast: number;
    southWest: number;
    northWest: number;
}, {
    northEast?: number | undefined;
    southEast?: number | undefined;
    southWest?: number | undefined;
    northWest?: number | undefined;
}>;
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
//# sourceMappingURL=elevation.d.ts.map