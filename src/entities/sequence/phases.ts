import type { AssertExact } from '@utils';
import { z } from 'zod';

/**
 * Iterable list of valid phases for a round.
 */
export const phases = [
  'cards',
  'commanders',
  'commands',
  'melee',
  'cleanup',
] as const;

/**
 * The schema for a phase of a round.
 */
export const phaseSchema: z.ZodType<Phase> = z.enum(phases);

// Helper type to check match of type against schema
type PhaseSchemaType = z.infer<typeof phaseSchema>;

/**
 * The type of a phase of a round.
 */
export type Phase = (typeof phases)[number];

const _assertExactPhase: AssertExact<Phase, PhaseSchemaType> = true;
