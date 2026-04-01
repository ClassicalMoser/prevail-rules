import type {
  LargeBoard,
  SmallBoard,
  StandardBoard,
  UnitPlacement,
  UnitWithPlacement,
} from '@entities';
import type { AssertExact } from '@utils';
import type { RoutState } from './routSubstep';
import {
  largeUnitPlacementSchema,
  largeUnitWithPlacementSchema,
  smallUnitPlacementSchema,
  smallUnitWithPlacementSchema,
  standardUnitPlacementSchema,
  standardUnitWithPlacementSchema,
} from '@entities';
import { z } from 'zod';
import { routStateSchema } from './routSubstep';

/**
 * Composable substep that handles unit retreat.
 *
 * This is a **composable substep** - it can be reused in multiple contexts:
 * - Used in `AttackApplyState` (when unit retreats after an attack)
 * - Used in `EngagementState` (when unit retreats from engagement)
 *
 * It demonstrates a **nearly recursive pattern**:
 * - Can contain `RoutState` (if no legal retreat options exist)
 * - This creates a pattern where routing can occur during retreat
 *
 * The expected event query `getExpectedRetreatEvent()` is composable and
 * delegates to `getExpectedRoutEvent()` when a rout state is present.
 */
export interface RetreatStateBase {
  /** The type of the substep. */
  substepType: 'retreat';
  /** The state of a rout caused by the retreat. */
  routState: RoutState | undefined;
  /** Whether the retreat has been completed. */
  completed: boolean;
}

/** Retreat on a standard board. */
export interface StandardRetreatState extends RetreatStateBase {
  boardType: 'standard';
  retreatingUnit: UnitWithPlacement<StandardBoard>;
  legalRetreatOptions: Set<UnitPlacement<StandardBoard>>;
  finalPosition: UnitPlacement<StandardBoard> | undefined;
}

/** Retreat on a small board. */
export interface SmallRetreatState extends RetreatStateBase {
  boardType: 'small';
  retreatingUnit: UnitWithPlacement<SmallBoard>;
  legalRetreatOptions: Set<UnitPlacement<SmallBoard>>;
  finalPosition: UnitPlacement<SmallBoard> | undefined;
}

/** Retreat on a large board. */
export interface LargeRetreatState extends RetreatStateBase {
  boardType: 'large';
  retreatingUnit: UnitWithPlacement<LargeBoard>;
  legalRetreatOptions: Set<UnitPlacement<LargeBoard>>;
  finalPosition: UnitPlacement<LargeBoard> | undefined;
}

/** Retreat substep for any board size (discriminated on `boardType`). */
export type RetreatState =
  | StandardRetreatState
  | SmallRetreatState
  | LargeRetreatState;

// ---------------------------------------------------------------------------
// Per-variant Zod schemas
// ---------------------------------------------------------------------------

const _standardRetreatStateSchemaObject = z.object({
  substepType: z.literal('retreat'),
  boardType: z.literal('standard' satisfies StandardBoard['boardType']),
  retreatingUnit: standardUnitWithPlacementSchema,
  legalRetreatOptions: z.set(standardUnitPlacementSchema),
  finalPosition: standardUnitPlacementSchema.or(z.undefined()),
  routState: routStateSchema.or(z.undefined()),
  completed: z.boolean(),
});

type StandardRetreatStateSchemaType = z.infer<
  typeof _standardRetreatStateSchemaObject
>;

const _assertExactStandardRetreatState: AssertExact<
  StandardRetreatState,
  StandardRetreatStateSchemaType
> = true;

export const standardRetreatStateSchema: z.ZodType<StandardRetreatState> =
  _standardRetreatStateSchemaObject;

const _smallRetreatStateSchemaObject = z.object({
  substepType: z.literal('retreat'),
  boardType: z.literal('small' satisfies SmallBoard['boardType']),
  retreatingUnit: smallUnitWithPlacementSchema,
  legalRetreatOptions: z.set(smallUnitPlacementSchema),
  finalPosition: smallUnitPlacementSchema.or(z.undefined()),
  routState: routStateSchema.or(z.undefined()),
  completed: z.boolean(),
});

type SmallRetreatStateSchemaType = z.infer<
  typeof _smallRetreatStateSchemaObject
>;

const _assertExactSmallRetreatState: AssertExact<
  SmallRetreatState,
  SmallRetreatStateSchemaType
> = true;

export const smallRetreatStateSchema: z.ZodType<SmallRetreatState> =
  _smallRetreatStateSchemaObject;

const _largeRetreatStateSchemaObject = z.object({
  substepType: z.literal('retreat'),
  boardType: z.literal('large' satisfies LargeBoard['boardType']),
  retreatingUnit: largeUnitWithPlacementSchema,
  legalRetreatOptions: z.set(largeUnitPlacementSchema),
  finalPosition: largeUnitPlacementSchema.or(z.undefined()),
  routState: routStateSchema.or(z.undefined()),
  completed: z.boolean(),
});

type LargeRetreatStateSchemaType = z.infer<
  typeof _largeRetreatStateSchemaObject
>;

const _assertExactLargeRetreatState: AssertExact<
  LargeRetreatState,
  LargeRetreatStateSchemaType
> = true;

export const largeRetreatStateSchema: z.ZodType<LargeRetreatState> =
  _largeRetreatStateSchemaObject;

// ---------------------------------------------------------------------------
// Wide union schema
// ---------------------------------------------------------------------------

const _retreatStateSchemaObject = z.discriminatedUnion('boardType', [
  _standardRetreatStateSchemaObject,
  _smallRetreatStateSchemaObject,
  _largeRetreatStateSchemaObject,
]);

/**
 * Schema for retreat state (any board). Per-variant AssertExact above; wide union not asserted.
 */
export const retreatStateSchema: z.ZodType<RetreatState> =
  _retreatStateSchemaObject;
