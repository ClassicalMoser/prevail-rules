import type { UnitInstance } from '@entities/unit';
import type { AssertExact } from '@utils';
import type { AttackResult } from '../attackResult';
import { unitInstanceSchema } from '@entities/unit';
import { z } from 'zod';
import { attackResultSchema } from '../attackResult';

/** The type for an attack result that has not yet been applied. */
export interface AttackApplyPending {
  /** The type of the substep. */
  substepType: 'attackApplyPending';
  /** The unit being attacked. */
  unit: UnitInstance;
  /** The total attack value. */
  totalAttackValue: number;
}

/** The schema for the state of the attack apply pending substep. */
const _attackApplyPendingStateSchemaObject = z.object({
  /** The type of the substep. */
  substepType: z.literal('attackApplyPending'),
  /** The unit being attacked. */
  unit: unitInstanceSchema,
  /** The total attack value. */
  totalAttackValue: z.number(),
});

type AttackApplyPendingStateSchemaType = z.infer<
  typeof _attackApplyPendingStateSchemaObject
>;

const _assertExactAttackApplyPending: AssertExact<
  AttackApplyPending,
  AttackApplyPendingStateSchemaType
> = true;

/** The type for an attack result that is being applied. */
export interface AttackApplyInProgress {
  /** The type of the substep. */
  substepType: 'attackApplyInProgress';
  /** The unit being attacked. */
  unit: UnitInstance;
  /** The result of the attack. */
  attackResult: AttackResult;
  /** Whether the rout has been resolved. */
  routResolved: boolean;
  /** Whether the retreat has been resolved. */
  retreatResolved: boolean;
  /** Whether the reverse has been resolved. */
  reverseResolved: boolean;
}

/** The schema for the state of the attack apply in progress substep. */
const _attackApplyInProgressStateSchemaObject = z.object({
  /** The type of the substep. */
  substepType: z.literal('attackApplyInProgress'),
  /** The unit being attacked. */
  unit: unitInstanceSchema,
  /** The result of the attack. */
  attackResult: attackResultSchema,
  /** Whether the rout has been resolved. */
  routResolved: z.boolean(),
  /** Whether the retreat has been resolved. */
  retreatResolved: z.boolean(),
  /** Whether the reverse has been resolved. */
  reverseResolved: z.boolean(),
});

type AttackApplyInProgressStateSchemaType = z.infer<
  typeof _attackApplyInProgressStateSchemaObject
>;

const _assertExactAttackApplyInProgress: AssertExact<
  AttackApplyInProgress,
  AttackApplyInProgressStateSchemaType
> = true;

export const attackApplyInProgressStateSchema: z.ZodType<AttackApplyInProgress> =
  _attackApplyInProgressStateSchemaObject;

export type AttackApplyState = AttackApplyPending | AttackApplyInProgress;

export const attackApplyStateSchema: z.ZodType<AttackApplyState> =
  z.discriminatedUnion('substepType', [
    _attackApplyPendingStateSchemaObject,
    _attackApplyInProgressStateSchemaObject,
  ]);
