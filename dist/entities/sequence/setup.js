import { z } from "zod";
import { playerSchema } from "../player/player.js";
export const setupSchema = z.object({
  /** The players in the game. */
  players: z.array(playerSchema),
  /** The unique identifier of the player who goes first. */
  firstChoice: z.string().uuid(),
});
/**
 * Assert that the setup matches the schema.
 */
export const _assertExactSetup = true;
