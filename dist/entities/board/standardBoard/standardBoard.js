import { z } from "zod";
import { boardSpaceSchema } from "../boardSpace.js";
import { standardBoardCoordinatesSchema } from "./standardCoordinates.js";
/**
 * The schema for a standard board.
 */
export const standardBoardSchema = z.record(standardBoardCoordinatesSchema, boardSpaceSchema);
const _assertExactStandardBoard = true;
