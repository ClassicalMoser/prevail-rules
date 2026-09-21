import type { CommandCard, HiddenCard } from '@entities';
import type { AssertExact } from '@utils';

import { commandCardSchema, hiddenCardSchema } from '@entities';
import { z } from 'zod';

/** A commitment that has been completed. */
export interface CompletedCommitment {
  /** The player has committed a card. */
  commitmentType: 'completed';
  /**
   * The card that is being committed.
   * Seat-visible folds may carry `'hidden'` for an opponent's commit.
   */
  card: CommandCard | HiddenCard;
}

const _completedCommitmentSchemaObject = z
  .object({
    /** The player has committed a card. */
    commitmentType: z.literal('completed'),
    /**
     * The card that is being committed.
     * Seat-visible folds may carry `'hidden'` for an opponent's commit.
     */
    card: z.union([commandCardSchema, hiddenCardSchema]),
  })
  .strict();

type CompletedCommitmentSchemaType = z.infer<
  typeof _completedCommitmentSchemaObject
>;

/** The schema for a completed commitment. */
export const completedCommitmentSchema: z.ZodObject<{
  commitmentType: z.ZodLiteral<'completed'>;
  card: z.ZodType<CommandCard | HiddenCard>;
}> = _completedCommitmentSchemaObject;

const _assertExactCompletedCommitment: AssertExact<
  CompletedCommitment,
  CompletedCommitmentSchemaType
> = true;
