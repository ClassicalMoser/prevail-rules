import { z } from "zod";
import { largeBoardSchema } from "./largeBoard/index.js";
import { smallBoardSchema } from "./smallBoard/index.js";
import { standardBoardSchema } from "./standardBoard/index.js";
export const boardSizeType = ["standard", "small", "large"];
export const boardSizeEnum = z.enum(boardSizeType);
/**
 * Assert that the board size type matches the schema.
 */
const _assertExactBoardSize = true;
/**
 * The schema for a board.
 */
export const boardSchema = z.discriminatedUnion("boardType", [
    smallBoardSchema,
    standardBoardSchema,
    largeBoardSchema,
]);
// Verify manual type matches schema inference
const _assertExactBoard = true;
