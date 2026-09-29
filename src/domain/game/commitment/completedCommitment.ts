import type { CommandCard } from '@entities';
import type { AssertExact } from '@utils';

import { commandCardSchema } from '@entities';
import { z } from 'zod';

/** A commitment that has been completed. */
export interface CompletedCommitment {
  /** The player has committed a card. */
  commitmentType: 'completed';
  /**
   * The card that is being committed.
   */
  card: CommandCard;
}

const _completedCommitmentSchemaObject = z
  .object({
    /** The player has committed a card. */
    commitmentType: z.literal('completed'),
    /**
     * The card that is being committed.
     */
    card: commandCardSchema,
  })
  .strict();

type CompletedCommitmentSchemaType = z.infer<
  typeof _completedCommitmentSchemaObject
>;

/** The schema for a completed commitment. */
export const completedCommitmentSchema: z.ZodObject<{
  commitmentType: z.ZodLiteral<'completed'>;
  card: z.ZodType<CommandCard>;
}> = _completedCommitmentSchemaObject;

const _assertExactCompletedCommitment: AssertExact<
  CompletedCommitment,
  CompletedCommitmentSchemaType
> = true;
