import { z } from "zod";
import { boardSizeEnum } from "./board/board.js";
export const gameType = ["standard", "mini", "tutorial"];
export const gameTypeEnum = z.enum(gameType);
/**
 * Check that the game type type matches the schema.
 */
const _assertExactGameType = true;
export const gameTypeStructureSchema = z.object({
    type: gameTypeEnum,
    boardSize: boardSizeEnum,
});
/**
 * Assert that the game type structure matches the schema.
 */
const _assertExactGameTypeStructure = true;
