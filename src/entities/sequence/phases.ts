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
 * The type of a phase of a round.
 */
export type Phase = (typeof phases)[number];

const _phaseSchemaObject = z.enum(phases);
type PhaseSchemaType = z.infer<typeof _phaseSchemaObject>;

/**
 * The schema for a phase of a round.
 */
export const phaseSchema: z.ZodType<Phase> = _phaseSchemaObject;

// Verify manual type matches schema inference
const _assertExactPhase: AssertExact<Phase, PhaseSchemaType> = true;
