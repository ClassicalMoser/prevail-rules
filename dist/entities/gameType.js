import { z } from "zod";
export const gameType = ["standard", "mini", "tutorial"];
export const gameTypeSchema = z.enum(gameType);
/**
 * Check that the game type type matches the schema.
 */
const _assertExactGameType = true;
