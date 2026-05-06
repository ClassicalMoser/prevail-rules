import type { Board, BoardCoordinate, LargeBoard, SmallBoard, StandardBoard } from "@entities";
import type { Commitment } from "@game/commitment";
import type { AssertExact } from "@utils";
import type { AttackApplyStateForBoard } from "./attackApplySubstep";
import {
  largeBoardCoordinateSchema,
  smallBoardCoordinateSchema,
  standardBoardCoordinateSchema,
} from "@entities";
import { commitmentSchema } from "@game/commitment";
import { z } from "zod";
import {
  largeAttackApplyStateSchema,
  smallAttackApplyStateSchema,
  standardAttackApplyStateSchema,
} from "./attackApplySubstep";

/**
 * Context-specific substep that resolves melee combat.
 *
 * This is a **context-specific substep** - it's tied to the `ResolveMeleePhase`.
 * It contains composable substeps:
 * - `AttackApplyState` (one for each player - white and black)
 *
 * Unlike composable substeps, this state is only used in one specific context.
 * Repeated for each melee that needs to be resolved in a round.
 */
export interface MeleeResolutionStateForBoard<TBoard extends Board> {
  /** The type of the substep. */
  substepType: "meleeResolution";
  /** The type of the board. */
  boardType: TBoard["boardType"];
  /** The location of the melee. */
  location: BoardCoordinate<TBoard>;
  /** The state of the white player's attack apply. */
  whiteAttackApplyState: AttackApplyStateForBoard<TBoard> | undefined;
  /** The state of the black player's attack apply. */
  blackAttackApplyState: AttackApplyStateForBoard<TBoard> | undefined;
  /** The white player's commitment.
   */
  whiteCommitment: Commitment;
  /** The black player's commitment.
   */
  blackCommitment: Commitment;
  /** Whether the melee resolution substep is complete. */
  completed: boolean;
}

export type MeleeResolutionState =
  | MeleeResolutionStateForBoard<SmallBoard>
  | MeleeResolutionStateForBoard<StandardBoard>
  | MeleeResolutionStateForBoard<LargeBoard>;

const _standardMeleeResolutionStateSchemaObject = z.object({
  substepType: z.literal("meleeResolution"),
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  location: standardBoardCoordinateSchema,
  whiteCommitment: commitmentSchema,
  blackCommitment: commitmentSchema,
  whiteAttackApplyState: standardAttackApplyStateSchema.or(z.undefined()),
  blackAttackApplyState: standardAttackApplyStateSchema.or(z.undefined()),
  completed: z.boolean(),
});

type StandardMeleeResolutionStateSchemaType = z.infer<
  typeof _standardMeleeResolutionStateSchemaObject
>;

const _assertExactStandardMeleeResolutionState: AssertExact<
  MeleeResolutionStateForBoard<StandardBoard>,
  StandardMeleeResolutionStateSchemaType
> = true;

export const standardMeleeResolutionStateSchema: z.ZodType<
  MeleeResolutionStateForBoard<StandardBoard>
> = _standardMeleeResolutionStateSchemaObject;

const _smallMeleeResolutionStateSchemaObject = z.object({
  substepType: z.literal("meleeResolution"),
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  location: smallBoardCoordinateSchema,
  whiteCommitment: commitmentSchema,
  blackCommitment: commitmentSchema,
  whiteAttackApplyState: smallAttackApplyStateSchema.or(z.undefined()),
  blackAttackApplyState: smallAttackApplyStateSchema.or(z.undefined()),
  completed: z.boolean(),
});

type SmallMeleeResolutionStateSchemaType = z.infer<typeof _smallMeleeResolutionStateSchemaObject>;

const _assertExactSmallMeleeResolutionState: AssertExact<
  MeleeResolutionStateForBoard<SmallBoard>,
  SmallMeleeResolutionStateSchemaType
> = true;

export const smallMeleeResolutionStateSchema: z.ZodType<MeleeResolutionStateForBoard<SmallBoard>> =
  _smallMeleeResolutionStateSchemaObject;

const _largeMeleeResolutionStateSchemaObject = z.object({
  substepType: z.literal("meleeResolution"),
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  location: largeBoardCoordinateSchema,
  whiteCommitment: commitmentSchema,
  blackCommitment: commitmentSchema,
  whiteAttackApplyState: largeAttackApplyStateSchema.or(z.undefined()),
  blackAttackApplyState: largeAttackApplyStateSchema.or(z.undefined()),
  completed: z.boolean(),
});

type LargeMeleeResolutionStateSchemaType = z.infer<typeof _largeMeleeResolutionStateSchemaObject>;

const _assertExactLargeMeleeResolutionState: AssertExact<
  MeleeResolutionStateForBoard<LargeBoard>,
  LargeMeleeResolutionStateSchemaType
> = true;

export const largeMeleeResolutionStateSchema: z.ZodType<MeleeResolutionStateForBoard<LargeBoard>> =
  _largeMeleeResolutionStateSchemaObject;

const _meleeResolutionStateSchemaObject = z.discriminatedUnion("boardType", [
  _standardMeleeResolutionStateSchemaObject,
  _smallMeleeResolutionStateSchemaObject,
  _largeMeleeResolutionStateSchemaObject,
]);

type MeleeResolutionStateSchemaType = z.infer<typeof _meleeResolutionStateSchemaObject>;

const _assertExactMeleeResolutionState: AssertExact<
  MeleeResolutionState,
  MeleeResolutionStateSchemaType
> = true;

/** Schema for melee resolution (any board). */
export const meleeResolutionStateSchema: z.ZodType<MeleeResolutionState> =
  _meleeResolutionStateSchemaObject;
