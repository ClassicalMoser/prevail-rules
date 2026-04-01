import type {
  LargeBoard,
  SmallBoard,
  StandardBoard,
  UnitInstance,
} from '@entities';
import type { AttackResult } from '@game/attackResult';
import type { AssertExact } from '@utils';
import type {
  LargeRetreatState,
  SmallRetreatState,
  StandardRetreatState,
} from './retreatSubstep';
import type {
  LargeReverseState,
  SmallReverseState,
  StandardReverseState,
} from './reverseSubstep';
import type { RoutState } from './routSubstep';
import { unitInstanceSchema } from '@entities';
import { attackResultSchema } from '@game/attackResult';
import { z } from 'zod';
import {
  largeRetreatStateSchema,
  smallRetreatStateSchema,
  standardRetreatStateSchema,
} from './retreatSubstep';
import {
  largeReverseStateSchema,
  smallReverseStateSchema,
  standardReverseStateSchema,
} from './reverseSubstep';
import { routStateSchema } from './routSubstep';

/**
 * Composable substep that applies the result of an attack.
 *
 * This is a **composable substep** - it can be reused in multiple contexts:
 * - Used in `RangedAttackResolutionState` (for ranged attacks)
 * - Used in `MeleeResolutionState` (for melee combat, one per player)
 *
 * It contains nested composable substeps:
 * - `RoutState` (if unit routed)
 * - `RetreatState` (if unit retreated)
 * - `ReverseState` (if unit reversed)
 *
 * The expected event query `getExpectedAttackApplyEvent()` is composable and
 * can be called from any parent context that contains this state.
 */
export interface AttackApplyStateBase {
  /** The type of the substep. */
  substepType: 'attackApply';
  /** The unit that is being attacked. */
  defendingUnit: UnitInstance;
  /** The result of the attack. */
  attackResult: AttackResult;
  /** The state of the rout. */
  routState: RoutState | undefined;
  /** Whether the attack apply substep is complete. */
  completed: boolean;
}

/** Attack apply on a standard board. */
export interface StandardAttackApplyState extends AttackApplyStateBase {
  boardType: 'standard';
  retreatState: StandardRetreatState | undefined;
  reverseState: StandardReverseState | undefined;
}

/** Attack apply on a small board. */
export interface SmallAttackApplyState extends AttackApplyStateBase {
  boardType: 'small';
  retreatState: SmallRetreatState | undefined;
  reverseState: SmallReverseState | undefined;
}

/** Attack apply on a large board. */
export interface LargeAttackApplyState extends AttackApplyStateBase {
  boardType: 'large';
  retreatState: LargeRetreatState | undefined;
  reverseState: LargeReverseState | undefined;
}

/** Attack apply for any board size (discriminated on `boardType`). */
export type AttackApplyState =
  | StandardAttackApplyState
  | SmallAttackApplyState
  | LargeAttackApplyState;

// ---------------------------------------------------------------------------
// Per-variant Zod schemas
// ---------------------------------------------------------------------------

const _standardAttackApplyStateSchemaObject = z.object({
  substepType: z.literal('attackApply'),
  boardType: z.literal('standard' satisfies StandardBoard['boardType']),
  defendingUnit: unitInstanceSchema,
  attackResult: attackResultSchema,
  routState: routStateSchema.or(z.undefined()),
  retreatState: standardRetreatStateSchema.or(z.undefined()),
  reverseState: standardReverseStateSchema.or(z.undefined()),
  completed: z.boolean(),
});

type StandardAttackApplyStateSchemaType = z.infer<
  typeof _standardAttackApplyStateSchemaObject
>;

const _assertExactStandardAttackApplyState: AssertExact<
  StandardAttackApplyState,
  StandardAttackApplyStateSchemaType
> = true;

export const standardAttackApplyStateSchema: z.ZodType<StandardAttackApplyState> =
  _standardAttackApplyStateSchemaObject;

const _smallAttackApplyStateSchemaObject = z.object({
  substepType: z.literal('attackApply'),
  boardType: z.literal('small' satisfies SmallBoard['boardType']),
  defendingUnit: unitInstanceSchema,
  attackResult: attackResultSchema,
  routState: routStateSchema.or(z.undefined()),
  retreatState: smallRetreatStateSchema.or(z.undefined()),
  reverseState: smallReverseStateSchema.or(z.undefined()),
  completed: z.boolean(),
});

type SmallAttackApplyStateSchemaType = z.infer<
  typeof _smallAttackApplyStateSchemaObject
>;

const _assertExactSmallAttackApplyState: AssertExact<
  SmallAttackApplyState,
  SmallAttackApplyStateSchemaType
> = true;

export const smallAttackApplyStateSchema: z.ZodType<SmallAttackApplyState> =
  _smallAttackApplyStateSchemaObject;

const _largeAttackApplyStateSchemaObject = z.object({
  substepType: z.literal('attackApply'),
  boardType: z.literal('large' satisfies LargeBoard['boardType']),
  defendingUnit: unitInstanceSchema,
  attackResult: attackResultSchema,
  routState: routStateSchema.or(z.undefined()),
  retreatState: largeRetreatStateSchema.or(z.undefined()),
  reverseState: largeReverseStateSchema.or(z.undefined()),
  completed: z.boolean(),
});

type LargeAttackApplyStateSchemaType = z.infer<
  typeof _largeAttackApplyStateSchemaObject
>;

const _assertExactLargeAttackApplyState: AssertExact<
  LargeAttackApplyState,
  LargeAttackApplyStateSchemaType
> = true;

export const largeAttackApplyStateSchema: z.ZodType<LargeAttackApplyState> =
  _largeAttackApplyStateSchemaObject;

// ---------------------------------------------------------------------------
// Wide union schema
// ---------------------------------------------------------------------------

const _attackApplyStateSchemaObject = z.discriminatedUnion('boardType', [
  _standardAttackApplyStateSchemaObject,
  _smallAttackApplyStateSchemaObject,
  _largeAttackApplyStateSchemaObject,
]);

/**
 * Schema for attack-apply state (any board). Per-variant AssertExact above; wide union not asserted.
 */
export const attackApplyStateSchema: z.ZodType<AttackApplyState> =
  _attackApplyStateSchemaObject;
