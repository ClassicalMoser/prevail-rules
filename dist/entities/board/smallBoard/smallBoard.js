import { z } from "zod";
import { boardSpaceSchema } from "../boardSpace.js";
import { smallBoardCoordinates } from "./smallCoordinates.js";
/**
 * Creates a Zod object schema for a board with all required coordinates.
 *
 * This builds a schema where each coordinate is a required key mapping to a BoardSpace.
 * By using z.object() with explicit keys (instead of z.record()), TypeScript can infer
 * the exact coordinate types rather than falling back to Record<string, BoardSpace>.
 *
 * @param coordinates - Array of coordinate strings (e.g., ["A-1", "A-2", ...])
 * @returns A ZodObject schema that validates an object with all coordinates as required keys
 *
 * The return type explicitly specifies:
 * - Shape: Record<T, typeof boardSpaceSchema> - each coordinate maps to boardSpaceSchema
 * - Unknown keys: "strip" - extra keys are removed during parsing
 * - Output/Input: Record<T, BoardSpace> - TypeScript infers the exact coordinate type
 */
function createBoardSchema(coordinates) {
    const shape = {};
    // Ensure all coordinates are included in the schema
    for (const coord of coordinates) {
        shape[coord] = boardSpaceSchema;
    }
    // Return the schema with explicit types
    return z.object(shape);
}
/**
 * The schema for a small board.
 */
export const smallBoardSchema = z.object({
    boardType: z.literal("small"),
    board: createBoardSchema(smallBoardCoordinates),
});
const _assertExactSmallBoard = true;
