import type { AssertExact } from "src/utils/assertExact.js";
import { z } from "zod";
export declare const playerSchema: z.ZodObject<{
    /** The unique identifier of the player. */
    id: z.ZodString;
    /** The name of the player. */
    name: z.ZodString;
    /** Whether the player is a bot. */
    isBot: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    isBot: boolean;
}, {
    id: string;
    name: string;
    isBot: boolean;
}>;
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
export declare const _assertExactPlayer: AssertExact<Player, PlayerSchemaType>;
export {};
//# sourceMappingURL=player.d.ts.map