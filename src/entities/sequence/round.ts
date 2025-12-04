import type { Phase } from '@entities';
import type { AssertExact } from '@utils';
import { phaseSchema } from '@entities';
import { z } from 'zod';

/**
 * The schema for a round.
 */
const _roundSchemaObject = z.object({
  /** The number of the round. */
  roundNumber: z.number().int().positive(),
  /** The phases that have been completed in the round. */
  completedPhases: z.set(phaseSchema),
  /** The start time of the round. */
  startTime: z.date(),
});

type RoundSchemaType = z.infer<typeof _roundSchemaObject>;
export const roundSchema: z.ZodType<Round> = _roundSchemaObject;

/**
 * A round of the game.
 */
export interface Round {
  roundNumber: number;
  completedPhases: Set<Phase>;
  startTime: Date;
}

const _assertExactRound: AssertExact<Round, RoundSchemaType> = true;
