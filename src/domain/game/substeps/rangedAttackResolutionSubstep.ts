import type { Board, LargeBoard, SmallBoard, StandardBoard, UnitInstance } from "@entities";
import type { Commitment } from "@game/commitment";
import type { AssertExact } from "@utils";
import type { AttackApplyStateForBoard } from "./attackApplySubstep";
import { unitInstanceSchema } from "@entities";
import { commitmentSchema } from "@game/commitment";
import { z } from "zod";
import {
  largeAttackApplyStateSchema,
  smallAttackApplyStateSchema,
  standardAttackApplyStateSchema,
} from "./attackApplySubstep";

/**
 * Context-specific substep that resolves ranged attack commands.
 *
 * This is a **context-specific substep** - it's tied to the `IssueCommandsPhase`.
 * It contains a composable substep:
 * - `AttackApplyState` (applies the result of the ranged attack)
 *
 * Unlike composable substeps, this state is only used in one specific context.
 */
export interface RangedAttackResolutionStateForBoard<TBoard extends Board> {
  /** The type of the substep. */
  substepType: "commandResolution";
  /** The type of command resolution. */
  commandResolutionType: "rangedAttack";
  /** The type of the board. */
  boardType: TBoard["boardType"];
  /** The unit that is attacking. */
  attackingUnit: UnitInstance;
  /** The unit that is being attacked. */
  defendingUnit: UnitInstance;
  /** The supporting units. */
  supportingUnits: Set<UnitInstance>;
  /** The state of the attack apply. */
  attackApplyState: AttackApplyStateForBoard<TBoard> | undefined;
  /** The commitment of the attacking player. */
  attackingCommitment: Commitment;
  /** The commitment of the defending player. */
  defendingCommitment: Commitment;
  /** Whether the ranged attack resolution substep is complete. */
  completed: boolean;
}

export type RangedAttackResolutionState =
  | RangedAttackResolutionStateForBoard<SmallBoard>
  | RangedAttackResolutionStateForBoard<StandardBoard>
  | RangedAttackResolutionStateForBoard<LargeBoard>;

const _standardRangedAttackResolutionStateSchemaObject = z.object({
  substepType: z.literal("commandResolution"),
  commandResolutionType: z.literal("rangedAttack"),
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  attackingUnit: unitInstanceSchema,
  defendingUnit: unitInstanceSchema,
  supportingUnits: z.set(unitInstanceSchema),
  attackingCommitment: commitmentSchema,
  defendingCommitment: commitmentSchema,
  attackApplyState: standardAttackApplyStateSchema.or(z.undefined()),
  completed: z.boolean(),
});

type StandardRangedAttackResolutionStateSchemaType = z.infer<
  typeof _standardRangedAttackResolutionStateSchemaObject
>;

const _assertExactStandardRangedAttackResolutionState: AssertExact<
  RangedAttackResolutionStateForBoard<StandardBoard>,
  StandardRangedAttackResolutionStateSchemaType
> = true;

export const standardRangedAttackResolutionStateSchema: z.ZodType<
  RangedAttackResolutionStateForBoard<StandardBoard>
> = _standardRangedAttackResolutionStateSchemaObject;

const _smallRangedAttackResolutionStateSchemaObject = z.object({
  substepType: z.literal("commandResolution"),
  commandResolutionType: z.literal("rangedAttack"),
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  attackingUnit: unitInstanceSchema,
  defendingUnit: unitInstanceSchema,
  supportingUnits: z.set(unitInstanceSchema),
  attackingCommitment: commitmentSchema,
  defendingCommitment: commitmentSchema,
  attackApplyState: smallAttackApplyStateSchema.or(z.undefined()),
  completed: z.boolean(),
});

type SmallRangedAttackResolutionStateSchemaType = z.infer<
  typeof _smallRangedAttackResolutionStateSchemaObject
>;

const _assertExactSmallRangedAttackResolutionState: AssertExact<
  RangedAttackResolutionStateForBoard<SmallBoard>,
  SmallRangedAttackResolutionStateSchemaType
> = true;

export const smallRangedAttackResolutionStateSchema: z.ZodType<
  RangedAttackResolutionStateForBoard<SmallBoard>
> = _smallRangedAttackResolutionStateSchemaObject;

const _largeRangedAttackResolutionStateSchemaObject = z.object({
  substepType: z.literal("commandResolution"),
  commandResolutionType: z.literal("rangedAttack"),
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  attackingUnit: unitInstanceSchema,
  defendingUnit: unitInstanceSchema,
  supportingUnits: z.set(unitInstanceSchema),
  attackingCommitment: commitmentSchema,
  defendingCommitment: commitmentSchema,
  attackApplyState: largeAttackApplyStateSchema.or(z.undefined()),
  completed: z.boolean(),
});

type LargeRangedAttackResolutionStateSchemaType = z.infer<
  typeof _largeRangedAttackResolutionStateSchemaObject
>;

const _assertExactLargeRangedAttackResolutionState: AssertExact<
  RangedAttackResolutionStateForBoard<LargeBoard>,
  LargeRangedAttackResolutionStateSchemaType
> = true;

export const largeRangedAttackResolutionStateSchema: z.ZodType<
  RangedAttackResolutionStateForBoard<LargeBoard>
> = _largeRangedAttackResolutionStateSchemaObject;

const _rangedAttackResolutionStateSchemaObject = z.discriminatedUnion("boardType", [
  _standardRangedAttackResolutionStateSchemaObject,
  _smallRangedAttackResolutionStateSchemaObject,
  _largeRangedAttackResolutionStateSchemaObject,
]);

type RangedAttackResolutionStateSchemaType = z.infer<
  typeof _rangedAttackResolutionStateSchemaObject
>;

const _assertExactRangedAttackResolutionState: AssertExact<
  RangedAttackResolutionState,
  RangedAttackResolutionStateSchemaType
> = true;

/** Schema for ranged attack resolution (any board) */
export const rangedAttackResolutionStateSchema: z.ZodType<RangedAttackResolutionState> =
  _rangedAttackResolutionStateSchemaObject;
