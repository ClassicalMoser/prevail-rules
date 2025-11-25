import type { AssertExact } from "src/utils/assertExact.js";
import type { Player } from "../player/player.js";
import { z } from "zod";
import { playerSchema } from "../player/player.js";

export const setupSchema = z.object({
  /** The players in the game. */
  players: z.array(playerSchema),
  /** The unique identifier of the player who goes first. */
  firstChoice: z.string().uuid(),
});

// Helper type to check match of type against schema
type SetupSchemaType = z.infer<typeof setupSchema>;

/**
 * The setup of a game.
 */
export interface Setup {
  /** The players in the game. */
  players: Player[];
  /** The unique identifier of the player who goes first. */
  firstChoice: string;
}

/**
 * Assert that the setup matches the schema.
 */
export const _assertExactSetup: AssertExact<Setup, SetupSchemaType> = true;
