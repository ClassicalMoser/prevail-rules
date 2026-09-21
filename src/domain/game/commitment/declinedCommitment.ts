import type { AssertExact } from '@utils';

import { z } from 'zod';

/** A commitment that has been declined. */
export interface DeclinedCommitment {
  /** The player chooses not to commit a card. */
  commitmentType: 'declined';
}

const _declinedCommitmentSchemaObject = z
  .object({
    /** The player chooses not to commit a card. */
    commitmentType: z.literal('declined'),
  })
  .strict();

type DeclinedCommitmentSchemaType = z.infer<
  typeof _declinedCommitmentSchemaObject
>;

/** The schema for a declined commitment. */
export const declinedCommitmentSchema: z.ZodObject<{
  commitmentType: z.ZodLiteral<'declined'>;
}> = _declinedCommitmentSchemaObject;

const _assertExactDeclinedCommitment: AssertExact<
  DeclinedCommitment,
  DeclinedCommitmentSchemaType
> = true;
