import type { Board, LargeBoard, SmallBoard, StandardBoard, UnitInstance } from "@entities";
import type { AttackResult } from "@game/attackResult";
import type { AssertExact } from "@utils";
import type { RetreatStateForBoard } from "./retreatSubstep";
import type { RoutState } from "./routSubstep";
import { unitInstanceSchema } from "@entities";
import { attackResultSchema } from "@game/attackResult";
import { z } from "zod";
import {
  largeRetreatStateSchema,
  smallRetreatStateSchema,
  standardRetreatStateSchema,
} from "./retreatSubstep";
import {
  largeReverseStateSchema,
  ReverseStateForBoard,
  smallReverseStateSchema,
  standardReverseStateSchema,
} from "./reverseSubstep";
import { routStateSchema } from "./routSubstep";

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
export interface AttackApplyStateForBoard<TBoard extends Board> {
  /** The type of the substep. */
  substepType: "attackApply";
  /** The type of the board. */
  boardType: TBoard["boardType"];
  /** The unit that is being attacked. */
  defendingUnit: UnitInstance;
  /** The result of the attack. */
  attackResult: AttackResult;
  /** The state of the reverse. */
  reverseState: ReverseStateForBoard<TBoard> | undefined;
  /** The state of the retreat. */
  retreatState: RetreatStateForBoard<TBoard> | undefined;
  /** The state of the rout. */
  routState: RoutState | undefined;
  /** Whether the attack apply substep is complete. */
  completed: boolean;
}

export type AttackApplyState =
  | AttackApplyStateForBoard<SmallBoard>
  | AttackApplyStateForBoard<StandardBoard>
  | AttackApplyStateForBoard<LargeBoard>;

// ---------------------------------------------------------------------------
// Per-variant Zod schemas
// ---------------------------------------------------------------------------

const _standardAttackApplyStateSchemaObject = z.object({
  substepType: z.literal("attackApply"),
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  defendingUnit: unitInstanceSchema,
  attackResult: attackResultSchema,
  routState: routStateSchema.or(z.undefined()),
  retreatState: standardRetreatStateSchema.or(z.undefined()),
  reverseState: standardReverseStateSchema.or(z.undefined()),
  completed: z.boolean(),
});

type StandardAttackApplyStateSchemaType = z.infer<typeof _standardAttackApplyStateSchemaObject>;

const _assertExactStandardAttackApplyState: AssertExact<
  AttackApplyStateForBoard<StandardBoard>,
  StandardAttackApplyStateSchemaType
> = true;

export const standardAttackApplyStateSchema: z.ZodType<AttackApplyStateForBoard<StandardBoard>> =
  _standardAttackApplyStateSchemaObject;

const _smallAttackApplyStateSchemaObject = z.object({
  substepType: z.literal("attackApply"),
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  defendingUnit: unitInstanceSchema,
  attackResult: attackResultSchema,
  routState: routStateSchema.or(z.undefined()),
  retreatState: smallRetreatStateSchema.or(z.undefined()),
  reverseState: smallReverseStateSchema.or(z.undefined()),
  completed: z.boolean(),
});

type SmallAttackApplyStateSchemaType = z.infer<typeof _smallAttackApplyStateSchemaObject>;

const _assertExactSmallAttackApplyState: AssertExact<
  AttackApplyStateForBoard<SmallBoard>,
  SmallAttackApplyStateSchemaType
> = true;

export const smallAttackApplyStateSchema: z.ZodType<AttackApplyStateForBoard<SmallBoard>> =
  _smallAttackApplyStateSchemaObject;

const _largeAttackApplyStateSchemaObject = z.object({
  substepType: z.literal("attackApply"),
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  defendingUnit: unitInstanceSchema,
  attackResult: attackResultSchema,
  routState: routStateSchema.or(z.undefined()),
  retreatState: largeRetreatStateSchema.or(z.undefined()),
  reverseState: largeReverseStateSchema.or(z.undefined()),
  completed: z.boolean(),
});

type LargeAttackApplyStateSchemaType = z.infer<typeof _largeAttackApplyStateSchemaObject>;

const _assertExactLargeAttackApplyState: AssertExact<
  AttackApplyStateForBoard<LargeBoard>,
  LargeAttackApplyStateSchemaType
> = true;

export const largeAttackApplyStateSchema: z.ZodType<AttackApplyStateForBoard<LargeBoard>> =
  _largeAttackApplyStateSchemaObject;

// ---------------------------------------------------------------------------
// Wide union schema
// ---------------------------------------------------------------------------

const _attackApplyStateSchemaObject = z.discriminatedUnion("boardType", [
  _standardAttackApplyStateSchemaObject,
  _smallAttackApplyStateSchemaObject,
  _largeAttackApplyStateSchemaObject,
]);

type AttackApplyStateSchemaType = z.infer<typeof _attackApplyStateSchemaObject>;

const _assertExactAttackApplyState: AssertExact<AttackApplyState, AttackApplyStateSchemaType> =
  true;

/**
 * Schema for attack-apply state (any board)
 */
export const attackApplyStateSchema: z.ZodType<AttackApplyState> = _attackApplyStateSchemaObject;
