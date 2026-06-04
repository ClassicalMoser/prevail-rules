import type {
  Board,
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
export interface RetreatStateForBoard<TBoard extends Board> {
  /** The type of the substep. */
  substepType: 'retreat';
  /** The type of the board. */
  boardType: TBoard['boardType'];
  /** The unit that is retreating. */
  retreatingUnit: UnitWithPlacement<TBoard>;
  /** The legal retreat options. */
  legalRetreatOptions: UnitPlacement<TBoard>[];
  /** The final position of the retreating unit. */
  finalPosition: UnitPlacement<TBoard> | undefined;
  /** The state of a rout caused by the retreat. */
  routState: RoutState | undefined;
  /** Whether the retreat has been completed. */
  completed: boolean;
}

export type RetreatState =
  | RetreatStateForBoard<SmallBoard>
  | RetreatStateForBoard<StandardBoard>
  | RetreatStateForBoard<LargeBoard>;

// ---------------------------------------------------------------------------
// Per-variant Zod schemas
// ---------------------------------------------------------------------------

const _standardRetreatStateSchemaObject = z.object({
  boardType: z.literal('standard' satisfies StandardBoard['boardType']),
  completed: z.boolean(),
  finalPosition: standardUnitPlacementSchema.or(z.undefined()),
  legalRetreatOptions: z.array(standardUnitPlacementSchema),
  retreatingUnit: standardUnitWithPlacementSchema,
  routState: routStateSchema.or(z.undefined()),
  substepType: z.literal('retreat'),
});

type StandardRetreatStateSchemaType = z.infer<
  typeof _standardRetreatStateSchemaObject
>;

const _assertExactStandardRetreatState: AssertExact<
  RetreatStateForBoard<StandardBoard>,
  StandardRetreatStateSchemaType
> = true;

export const standardRetreatStateSchema: z.ZodType<
  RetreatStateForBoard<StandardBoard>
> = _standardRetreatStateSchemaObject;

const _smallRetreatStateSchemaObject = z.object({
  boardType: z.literal('small' satisfies SmallBoard['boardType']),
  completed: z.boolean(),
  finalPosition: smallUnitPlacementSchema.or(z.undefined()),
  legalRetreatOptions: z.array(smallUnitPlacementSchema),
  retreatingUnit: smallUnitWithPlacementSchema,
  routState: routStateSchema.or(z.undefined()),
  substepType: z.literal('retreat'),
});

type SmallRetreatStateSchemaType = z.infer<
  typeof _smallRetreatStateSchemaObject
>;

const _assertExactSmallRetreatState: AssertExact<
  RetreatStateForBoard<SmallBoard>,
  SmallRetreatStateSchemaType
> = true;

export const smallRetreatStateSchema: z.ZodType<
  RetreatStateForBoard<SmallBoard>
> = _smallRetreatStateSchemaObject;

const _largeRetreatStateSchemaObject = z.object({
  boardType: z.literal('large' satisfies LargeBoard['boardType']),
  completed: z.boolean(),
  finalPosition: largeUnitPlacementSchema.or(z.undefined()),
  legalRetreatOptions: z.array(largeUnitPlacementSchema),
  retreatingUnit: largeUnitWithPlacementSchema,
  routState: routStateSchema.or(z.undefined()),
  substepType: z.literal('retreat'),
});

type LargeRetreatStateSchemaType = z.infer<
  typeof _largeRetreatStateSchemaObject
>;

const _assertExactLargeRetreatState: AssertExact<
  RetreatStateForBoard<LargeBoard>,
  LargeRetreatStateSchemaType
> = true;

export const largeRetreatStateSchema: z.ZodType<
  RetreatStateForBoard<LargeBoard>
> = _largeRetreatStateSchemaObject;

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
