import type {
  Board,
  LargeBoard,
  SmallBoard,
  StandardBoard,
  UnitPlacement,
  UnitWithPlacement,
} from "@entities";
import type { AssertExact } from "@utils";
import {
  largeUnitPlacementSchema,
  largeUnitWithPlacementSchema,
  smallUnitPlacementSchema,
  smallUnitWithPlacementSchema,
  standardUnitPlacementSchema,
  standardUnitWithPlacementSchema,
} from "@entities";
import { z } from "zod";

/**
 * Composable substep that handles unit reversal after an attack.
 *
 * This is a **composable substep** - it can be reused in multiple contexts:
 * - Used in `AttackApplyState` (when unit reverses after an attack)
 *
 * The expected event query `getExpectedReverseEvent()` is composable and
 * can be called from any parent context that contains this state.
 */
export interface ReverseStateForBoard<TBoard extends Board> {
  /** The type of the substep. */
  substepType: "reverse";
  /** The type of the board. */
  boardType: TBoard["boardType"];
  /** The unit that is reversing. */
  reversingUnit: UnitWithPlacement<TBoard>;
  /** The final position of the reversing unit. */
  finalPosition: UnitPlacement<TBoard> | undefined;
  /** Whether the reverse has been completed. */
  completed: boolean;
}

export type ReverseState =
  | ReverseStateForBoard<SmallBoard>
  | ReverseStateForBoard<StandardBoard>
  | ReverseStateForBoard<LargeBoard>;

// ---------------------------------------------------------------------------
// Per-variant Zod schemas
// ---------------------------------------------------------------------------

const _standardReverseStateSchemaObject = z.object({
  substepType: z.literal("reverse"),
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  reversingUnit: standardUnitWithPlacementSchema,
  finalPosition: standardUnitPlacementSchema.or(z.undefined()),
  completed: z.boolean(),
});

type StandardReverseStateSchemaType = z.infer<typeof _standardReverseStateSchemaObject>;

const _assertExactStandardReverseState: AssertExact<
  ReverseStateForBoard<StandardBoard>,
  StandardReverseStateSchemaType
> = true;

export const standardReverseStateSchema: z.ZodType<ReverseStateForBoard<StandardBoard>> =
  _standardReverseStateSchemaObject;

const _smallReverseStateSchemaObject = z.object({
  substepType: z.literal("reverse"),
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  reversingUnit: smallUnitWithPlacementSchema,
  finalPosition: smallUnitPlacementSchema.or(z.undefined()),
  completed: z.boolean(),
});

type SmallReverseStateSchemaType = z.infer<typeof _smallReverseStateSchemaObject>;

const _assertExactSmallReverseState: AssertExact<
  ReverseStateForBoard<SmallBoard>,
  SmallReverseStateSchemaType
> = true;

export const smallReverseStateSchema: z.ZodType<ReverseStateForBoard<SmallBoard>> =
  _smallReverseStateSchemaObject;

const _largeReverseStateSchemaObject = z.object({
  substepType: z.literal("reverse"),
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  reversingUnit: largeUnitWithPlacementSchema,
  finalPosition: largeUnitPlacementSchema.or(z.undefined()),
  completed: z.boolean(),
});

type LargeReverseStateSchemaType = z.infer<typeof _largeReverseStateSchemaObject>;

const _assertExactLargeReverseState: AssertExact<
  ReverseStateForBoard<LargeBoard>,
  LargeReverseStateSchemaType
> = true;

export const largeReverseStateSchema: z.ZodType<ReverseStateForBoard<LargeBoard>> =
  _largeReverseStateSchemaObject;

// ---------------------------------------------------------------------------
// Wide union schema
// ---------------------------------------------------------------------------

const _reverseStateSchemaObject = z.discriminatedUnion("boardType", [
  _standardReverseStateSchemaObject,
  _smallReverseStateSchemaObject,
  _largeReverseStateSchemaObject,
]);

type ReverseStateSchemaType = z.infer<typeof _reverseStateSchemaObject>;

const _assertExactReverseState: AssertExact<ReverseState, ReverseStateSchemaType> = true;

/**
 * Schema for reverse state (any board). Per-variant AssertExact above; wide union not asserted.
 */
export const reverseStateSchema: z.ZodType<ReverseState> = _reverseStateSchemaObject;
