import type { AssertExact } from "../../utils/assertExact.js";
import type { Phase } from "./phases.js";
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

// Helper type to check match of type against schema
type RoundSchemaType = z.infer<typeof roundSchema>;

/**
 * A round of the game.
 */
export interface Round {
  roundNumber: number;
  completedPhases: Set<Phase>;
  startTime: Date;
}

const _assertExactRound: AssertExact<Round, RoundSchemaType> = true;
