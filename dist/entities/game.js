import { z } from "zod";
import { armySchema } from "./army/army.js";
import { gameTypeEnum } from "./gameType.js";
/**
 * The schema for a complete game of Prevail: Ancient Battles.
 */
export const gameSchema = z.object({
    /** The unique identifier of the game. */
    id: z.string().uuid(),
    /** The type of game. */
    gameType: gameTypeEnum,
    /** The unique identifier of the player on the black side of the game. */
    blackPlayer: z.string().uuid(),
    /** The unique identifier of the player on the white side of the game. */
    whitePlayer: z.string().uuid(),
    /** The army brought by the black player. */
    blackArmy: armySchema,
    /** The army brought by the white player. */
    whiteArmy: armySchema,
});
const _assertExactGame = true;
