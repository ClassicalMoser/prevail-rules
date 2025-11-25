import { z } from "zod";
import { largeBoardSchema } from "./largeBoard/index.js";
import { smallBoardSchema } from "./smallBoard/index.js";
import { standardBoardSchema } from "./standardBoard/index.js";
/**
 * The schema for a board.
 */
export const boardSchema = z.discriminatedUnion("boardType", [
    standardBoardSchema,
    smallBoardSchema,
    largeBoardSchema,
]);
// Verify manual type matches schema inference
const _assertExactBoard = true;
