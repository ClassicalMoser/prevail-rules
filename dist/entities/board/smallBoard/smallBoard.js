import { z } from "zod";
import { boardSpaceSchema } from "../boardSpace.js";
import { smallBoardCoordinatesSchema } from "./smallCoordinates.js";
/**
 * The schema for a small board.
 */
export const smallBoardSchema = z.object({
    boardType: z.literal("small"),
    board: z.record(smallBoardCoordinatesSchema, boardSpaceSchema),
});
const _assertExactSmallBoard = true;
