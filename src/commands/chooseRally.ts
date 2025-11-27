import type { PlayerSide } from "src/entities/player/playerSide.js";
import type { AssertExact } from "src/utils/assertExact.js";
import { playerSideSchema } from "src/entities/player/playerSide.js";
import { z } from "zod";

/** The schema for a choose rally command. */
export const chooseRallyCommandSchema = z.object({
  /** The player who is choosing whether to perform a rally. */
  player: playerSideSchema,
  /** Whether the player is performing a rally. */
  performRally: z.boolean(),
});

// Helper type to check match of type against schema.
type ChooseRallyCommandSchemaType = z.infer<typeof chooseRallyCommandSchema>;

/** A command to choose a rally from the player's hand. */
export interface ChooseRallyCommand {
  /** The player who is choosing whether to perform a rally. */
  player: PlayerSide;
  /** Whether the player is performing a rally. */
  performRally: boolean;
}

// Helper type to check match of type against schema.
const _assertExactChooseRallyCommand: AssertExact<
  ChooseRallyCommand,
  ChooseRallyCommandSchemaType
> = true;
