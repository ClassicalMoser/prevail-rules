import type { AssertExact } from "src/utils/assertExact.js";
import type { Player } from "../player/player.js";
import { z } from "zod";
export declare const setupSchema: z.ZodObject<{
    /** The players in the game. */
    players: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        isBot: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        isBot: boolean;
    }, {
        id: string;
        name: string;
        isBot: boolean;
    }>, "many">;
    /** The unique identifier of the player who goes first. */
    firstChoice: z.ZodString;
}, "strip", z.ZodTypeAny, {
    players: {
        id: string;
        name: string;
        isBot: boolean;
    }[];
    firstChoice: string;
}, {
    players: {
        id: string;
        name: string;
        isBot: boolean;
    }[];
    firstChoice: string;
}>;
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
export declare const _assertExactSetup: AssertExact<Setup, SetupSchemaType>;
export {};
//# sourceMappingURL=setup.d.ts.map