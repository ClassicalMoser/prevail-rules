import type { PlayerSide } from "src/entities/player/playerSide.js";
import { z } from "zod";
/** The schema for a choose rally command. */
export declare const chooseRallyCommandSchema: z.ZodObject<{
    /** The player who is choosing whether to perform a rally. */
    player: z.ZodEnum<["black", "white"]>;
    /** Whether the player is performing a rally. */
    performRally: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    player: "black" | "white";
    performRally: boolean;
}, {
    player: "black" | "white";
    performRally: boolean;
}>;
/** A command to choose a rally from the player's hand. */
export interface ChooseRallyCommand {
    /** The player who is choosing whether to perform a rally. */
    player: PlayerSide;
    /** Whether the player is performing a rally. */
    performRally: boolean;
}
//# sourceMappingURL=chooseRally.d.ts.map