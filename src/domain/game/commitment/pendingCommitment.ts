import type { AssertExact } from '@utils';

import { z } from 'zod';

/** A commitment that has not yet been decided. */
export interface PendingCommitment {
  /** The player has not yet decided whether to commit a card. */
  commitmentType: 'pending';
}

const _pendingCommitmentSchemaObject = z
  .object({
    /** The player has not yet decided whether to commit a card. */
    commitmentType: z.literal('pending'),
  })
  .strict();

type PendingCommitmentSchemaType = z.infer<
  typeof _pendingCommitmentSchemaObject
>;

/** The schema for a pending commitment. */
export const pendingCommitmentSchema: z.ZodObject<{
  commitmentType: z.ZodLiteral<'pending'>;
}> = _pendingCommitmentSchemaObject;

const _assertExactPendingCommitment: AssertExact<
  PendingCommitment,
  PendingCommitmentSchemaType
> = true;
