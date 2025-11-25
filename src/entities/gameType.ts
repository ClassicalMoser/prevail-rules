import type { AssertExact } from "src/utils/assertExact.js";
import { z } from "zod";

export const gameType = ["standard", "mini", "tutorial"] as const;

export const gameTypeSchema = z.enum(gameType);

type GameTypeSchemaType = z.infer<typeof gameTypeSchema>;

/**
 * A type of game.
 */
export type GameType = (typeof gameType)[number];

/**
 * Check that the game type type matches the schema.
 */
const _assertExactGameType: AssertExact<GameType, GameTypeSchemaType> = true;
