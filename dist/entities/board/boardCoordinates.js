import { z } from "zod";
import { largeBoardCoordinates } from "./largeBoard/largeCoordinates.js";
import { smallBoardCoordinates } from "./smallBoard/smallCoordinates.js";
import { standardBoardCoordinates } from "./standardBoard/standardCoordinates.js";
/**
 * All valid coordinates across all board types, deduplicated.
 *
 * Combines coordinates from standard, small, and large boards, removing duplicates.
 * Coordinates like "A-1" may exist in multiple board types, so we deduplicate.
 * The `satisfies` clause ensures the array contains only valid coordinate types
 * while preserving literal types for proper enum inference.
 */
const allBoardCoordinates = [
    ...new Set([
        ...standardBoardCoordinates,
        ...smallBoardCoordinates,
        ...largeBoardCoordinates,
    ]),
];
/**
 * The schema for a board coordinate.
 *
 * PERMISSIVE SCHEMA:
 * This schema is permissive in that it allows any string that matches the pattern of a board coordinate.
 * This is useful because it allows for any coordinate from any board type to be used in a command.
 *
 * Commands must still be validated against the specific board type schema, and for rule compliance.
 *
 */
export const boardCoordinateSchema = z.enum(allBoardCoordinates);
