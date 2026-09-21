import type { AssertExact } from '@utils';
import type { CompletedCommitment } from './completedCommitment';
import type { DeclinedCommitment } from './declinedCommitment';
import type { PendingCommitment } from './pendingCommitment';

import { z } from 'zod';
import { completedCommitmentSchema } from './completedCommitment';
import { declinedCommitmentSchema } from './declinedCommitment';
import { pendingCommitmentSchema } from './pendingCommitment';

/** A player's commitment of a card. */
export type Commitment =
  | PendingCommitment
  | DeclinedCommitment
  | CompletedCommitment;

const _commitmentSchemaObject = z.discriminatedUnion('commitmentType', [
  pendingCommitmentSchema,
  declinedCommitmentSchema,
  completedCommitmentSchema,
]);

type CommitmentSchemaType = z.infer<typeof _commitmentSchemaObject>;

/** The schema for a commitment. */
export const commitmentSchema: z.ZodType<Commitment> = _commitmentSchemaObject;

const _assertExactCommitment: AssertExact<Commitment, CommitmentSchemaType> =
  true;
