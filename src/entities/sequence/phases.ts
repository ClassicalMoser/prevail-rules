import type { AssertExact } from "src/utils/assertExact.js";
import { z } from "zod";

/**
 * List of valid phases for a round.
 */
export const phases = [
  "cards",
  "initiative",
  "command",
  "ranged",
  "movement",
  "melee",
  "cleanup",
] as const;

/**
 * The schema for a phase of a round.
 */
export const phaseSchema = z.enum(phases);

// Helper type to check match of type against schema
type PhaseSchemaType = z.infer<typeof phaseSchema>;

/**
 * The type of a phase of a round.
 */
export type Phase = (typeof phases)[number];

const _assertExactPhase: AssertExact<Phase, PhaseSchemaType> = true;
