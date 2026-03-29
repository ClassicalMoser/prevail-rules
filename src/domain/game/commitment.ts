import type { Card } from '@entities';
import type { AssertExact } from '@utils';
import { cardSchema } from '@entities';
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

type PendingCommitmentSchemaType = z.infer<
  typeof _pendingCommitmentSchemaObject
>;

/** The schema for a pending commitment. */
export const pendingCommitmentSchema: z.ZodType<PendingCommitment> =
  _pendingCommitmentSchemaObject;

const _assertExactPendingCommitment: AssertExact<
  PendingCommitment,
  PendingCommitmentSchemaType
> = true;

/** A commitment that has been declined. */
export interface DeclinedCommitment {
  /** The player chooses not to commit a card. */
  commitmentType: 'declined';
}

const _declinedCommitmentSchemaObject = z.object({
  /** The player chooses not to commit a card. */
  commitmentType: z.literal('declined'),
});

type DeclinedCommitmentSchemaType = z.infer<
  typeof _declinedCommitmentSchemaObject
>;

/** The schema for a declined commitment. */
export const declinedCommitmentSchema: z.ZodType<DeclinedCommitment> =
  _declinedCommitmentSchemaObject;

const _assertExactDeclinedCommitment: AssertExact<
  DeclinedCommitment,
  DeclinedCommitmentSchemaType
> = true;

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

/** The schema for a completed commitment. */
export const completedCommitmentSchema: z.ZodType<CompletedCommitment> =
  _completedCommitmentSchemaObject;

const _assertExactCompletedCommitment: AssertExact<
  CompletedCommitment,
  CompletedCommitmentSchemaType
> = true;

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

/** The schema for a commitment. */
export const commitmentSchema: z.ZodType<Commitment> = _commitmentSchemaObject;

const _assertExactCommitment: AssertExact<Commitment, CommitmentSchemaType> =
  true;
