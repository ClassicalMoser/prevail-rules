import { z } from "zod";
import { phaseSchema } from "./phases.js";
/**
 * The schema for a round.
 */
export const roundSchema = z.object({
    roundNumber: z.number().int().positive(),
    completedPhases: z.set(phaseSchema),
    startTime: z.date(),
});
const _assertExactRound = true;
