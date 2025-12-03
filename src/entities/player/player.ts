import type { AssertExact } from "@utils/assertExact.js";
import { z } from "zod";

export const playerSchema = z.object({
  /** The unique identifier of the player. */
  id: z.string().uuid(),
  /** The name of the player. */
  name: z.string(),
  /** Whether the player is a bot. */
  isBot: z.boolean(),
});

// Helper type to check match of type against schema
type PlayerSchemaType = z.infer<typeof playerSchema>;

/**
 * A player in the game.
 */
export interface Player {
  /** The unique identifier of the player. */
  id: string;
  /** The name of the player. */
  name: string;
  /** Whether the player is a bot. */
  isBot: boolean;
}

/**
 * Assert that the player matches the schema.
 */
export const _assertExactPlayer: AssertExact<Player, PlayerSchemaType> = true;
