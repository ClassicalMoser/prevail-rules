import type {
  LargeBoard,
  SmallBoard,
  StandardBoard,
  UnitPlacement,
  UnitWithPlacement,
} from '@entities';
import type { AssertExact } from '@utils';
import {
  largeUnitPlacementSchema,
  largeUnitWithPlacementSchema,
  smallUnitPlacementSchema,
  smallUnitWithPlacementSchema,
  standardUnitPlacementSchema,
  standardUnitWithPlacementSchema,
} from '@entities';
import { z } from 'zod';

/**
 * Composable substep that handles unit reversal after an attack.
 *
 * This is a **composable substep** - it can be reused in multiple contexts:
 * - Used in `AttackApplyState` (when unit reverses after an attack)
 *
 * The expected event query `getExpectedReverseEvent()` is composable and
 * can be called from any parent context that contains this state.
 */
export interface ReverseStateBase {
  /** The type of the substep. */
  substepType: 'reverse';
  /** Whether the reverse has been completed. */
  completed: boolean;
}

/** Reverse on a standard board. */
export interface StandardReverseState extends ReverseStateBase {
  boardType: 'standard';
  reversingUnit: UnitWithPlacement<StandardBoard>;
  finalPosition: UnitPlacement<StandardBoard> | undefined;
}

/** Reverse on a small board. */
export interface SmallReverseState extends ReverseStateBase {
  boardType: 'small';
  reversingUnit: UnitWithPlacement<SmallBoard>;
  finalPosition: UnitPlacement<SmallBoard> | undefined;
}

/** Reverse on a large board. */
export interface LargeReverseState extends ReverseStateBase {
  boardType: 'large';
  reversingUnit: UnitWithPlacement<LargeBoard>;
  finalPosition: UnitPlacement<LargeBoard> | undefined;
}

/** Reverse substep for any board size (discriminated on `boardType`). */
export type ReverseState =
  | StandardReverseState
  | SmallReverseState
  | LargeReverseState;

// ---------------------------------------------------------------------------
// Per-variant Zod schemas
// ---------------------------------------------------------------------------

const _standardReverseStateSchemaObject = z.object({
  substepType: z.literal('reverse'),
  boardType: z.literal('standard' satisfies StandardBoard['boardType']),
  reversingUnit: standardUnitWithPlacementSchema,
  finalPosition: standardUnitPlacementSchema.or(z.undefined()),
  completed: z.boolean(),
});

type StandardReverseStateSchemaType = z.infer<
  typeof _standardReverseStateSchemaObject
>;

const _assertExactStandardReverseState: AssertExact<
  StandardReverseState,
  StandardReverseStateSchemaType
> = true;

export const standardReverseStateSchema: z.ZodType<StandardReverseState> =
  _standardReverseStateSchemaObject;

const _smallReverseStateSchemaObject = z.object({
  substepType: z.literal('reverse'),
  boardType: z.literal('small' satisfies SmallBoard['boardType']),
  reversingUnit: smallUnitWithPlacementSchema,
  finalPosition: smallUnitPlacementSchema.or(z.undefined()),
  completed: z.boolean(),
});

type SmallReverseStateSchemaType = z.infer<
  typeof _smallReverseStateSchemaObject
>;

const _assertExactSmallReverseState: AssertExact<
  SmallReverseState,
  SmallReverseStateSchemaType
> = true;

export const smallReverseStateSchema: z.ZodType<SmallReverseState> =
  _smallReverseStateSchemaObject;

const _largeReverseStateSchemaObject = z.object({
  substepType: z.literal('reverse'),
  boardType: z.literal('large' satisfies LargeBoard['boardType']),
  reversingUnit: largeUnitWithPlacementSchema,
  finalPosition: largeUnitPlacementSchema.or(z.undefined()),
  completed: z.boolean(),
});

type LargeReverseStateSchemaType = z.infer<
  typeof _largeReverseStateSchemaObject
>;

const _assertExactLargeReverseState: AssertExact<
  LargeReverseState,
  LargeReverseStateSchemaType
> = true;

export const largeReverseStateSchema: z.ZodType<LargeReverseState> =
  _largeReverseStateSchemaObject;

// ---------------------------------------------------------------------------
// Wide union schema
// ---------------------------------------------------------------------------

const _reverseStateSchemaObject = z.discriminatedUnion('boardType', [
  _standardReverseStateSchemaObject,
  _smallReverseStateSchemaObject,
  _largeReverseStateSchemaObject,
]);

/**
 * Schema for reverse state (any board). Per-variant AssertExact above; wide union not asserted.
 */
export const reverseStateSchema: z.ZodType<ReverseState> =
  _reverseStateSchemaObject;
