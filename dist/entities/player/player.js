import { z } from "zod";
export const playerSchema = z.object({
    /** The unique identifier of the player. */
    id: z.string().uuid(),
    /** The name of the player. */
    name: z.string(),
    /** Whether the player is a bot. */
    isBot: z.boolean(),
});
/**
 * Assert that the player matches the schema.
 */
export const _assertExactPlayer = true;
