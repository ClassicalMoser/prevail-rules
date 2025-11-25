import { z } from "zod";
import { boardSpaceSchema } from "../boardSpace.js";
import { largeBoardCoordinatesSchema } from "./largeCoordinates.js";
/**
 * The schema for a large board.
 */
export const largeBoardSchema = z.object({
    boardType: z.literal("large"),
    board: z.record(largeBoardCoordinatesSchema, boardSpaceSchema),
});
const _assertExactLargeBoard = true;
