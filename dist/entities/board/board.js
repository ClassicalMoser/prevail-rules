import { z } from "zod";
import { smallBoardSchema } from "./smallBoard/index.js";
import { standardBoardSchema } from "./standardBoard/index.js";
/**
 * The schema for a board.
 */
export const boardSchema = z.discriminatedUnion("boardType", [
    standardBoardSchema,
    smallBoardSchema,
]);
