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
const _assertExactChooseRallyCommand = true;
