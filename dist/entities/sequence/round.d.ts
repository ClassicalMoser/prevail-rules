import type { Phase } from "./phases.js";
import { z } from "zod";
/**
 * The schema for a round.
 */
export declare const roundSchema: z.ZodObject<{
    roundNumber: z.ZodNumber;
    completedPhases: z.ZodSet<z.ZodEnum<["cards", "initiative", "command", "ranged", "movement", "melee", "cleanup"]>>;
    startTime: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    roundNumber: number;
    completedPhases: Set<"initiative" | "ranged" | "command" | "cards" | "movement" | "melee" | "cleanup">;
    startTime: Date;
}, {
    roundNumber: number;
    completedPhases: Set<"initiative" | "ranged" | "command" | "cards" | "movement" | "melee" | "cleanup">;
    startTime: Date;
}>;
/**
 * A round of the game.
 */
export interface Round {
    roundNumber: number;
    completedPhases: Set<Phase>;
    startTime: Date;
}
//# sourceMappingURL=round.d.ts.map