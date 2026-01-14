import type { Card } from '@entities/card';
import type { AssertExact } from '@utils';
import { cardSchema } from '@entities/card';
import { z } from 'zod';

/** A commitment that has not  */
export interface PendingCommitment {
  /** The player has not yet decided whether to commit a card. */
  commitmentType: 'pending';
}

const _pendingCommitmentSchemaObject = z.object({
  /** The player has not yet decided whether to commit a card. */
  commitmentType: z.literal('pending'),
});

const _assertExactPendingCommitment: AssertExact<
  PendingCommitment,
  PendingCommitmentSchemaType
> = true;

/** The schema for a pending commitment. */
export const pendingCommitmentSchema: z.ZodType<PendingCommitment> =
  _pendingCommitmentSchemaObject;
type PendingCommitmentSchemaType = z.infer<
  typeof _pendingCommitmentSchemaObject
>;

/** A commitment that has been declined. */
export interface DeclinedCommitment {
  /** The player chooses not to commit a card. */
  commitmentType: 'declined';
}

const _declinedCommitmentSchemaObject = z.object({
  /** The player chooses not to commit a card. */
  commitmentType: z.literal('declined'),
});

const _assertExactDeclinedCommitment: AssertExact<
  DeclinedCommitment,
  DeclinedCommitmentSchemaType
> = true;

/** The schema for a declined commitment. */
export const declinedCommitmentSchema: z.ZodType<DeclinedCommitment> =
  _declinedCommitmentSchemaObject;
type DeclinedCommitmentSchemaType = z.infer<
  typeof _declinedCommitmentSchemaObject
>;

/** A commitment that has been completed. */
export interface CompletedCommitment {
  /** The player has committed a card. */
  commitmentType: 'completed';
  /** The card that is being committed. */
  card: Card;
}

const _completedCommitmentSchemaObject = z.object({
  /** The player has committed a card. */
  commitmentType: z.literal('completed'),
  /** The card that is being committed. */
  card: cardSchema,
});

type CompletedCommitmentSchemaType = z.infer<
  typeof _completedCommitmentSchemaObject
>;

const _assertExactCompletedCommitment: AssertExact<
  CompletedCommitment,
  CompletedCommitmentSchemaType
> = true;

/** The schema for a completed commitment. */
export const completedCommitmentSchema: z.ZodType<CompletedCommitment> =
  _completedCommitmentSchemaObject;

/** A player's commitment of a card. */
export type Commitment =
  | PendingCommitment
  | DeclinedCommitment
  | CompletedCommitment;

const _commitmentSchemaObject = z.discriminatedUnion('commitmentType', [
  _pendingCommitmentSchemaObject,
  _declinedCommitmentSchemaObject,
  _completedCommitmentSchemaObject,
]);

type CommitmentSchemaType = z.infer<typeof _commitmentSchemaObject>;

const _assertExactCommitment: AssertExact<Commitment, CommitmentSchemaType> =
  true;

/** The schema for a commitment. */
export const commitmentSchema: z.ZodType<Commitment> = _commitmentSchemaObject;
