import type {
  Board,
  LargeBoard,
  SmallBoard,
  StandardBoard,
  UnitPlacement,
  UnitWithPlacement,
} from "@entities";
import type { Commitment } from "@game/commitment";
import type { AssertExact } from "@utils";
import type { EngagementStateForBoard } from "./engagement";
import {
  largeUnitPlacementSchema,
  largeUnitWithPlacementSchema,
  smallUnitPlacementSchema,
  smallUnitWithPlacementSchema,
  standardUnitPlacementSchema,
  standardUnitWithPlacementSchema,
} from "@entities";
import { commitmentSchema } from "@game/commitment";
import { z } from "zod";
import {
  largeEngagementStateSchema,
  smallEngagementStateSchema,
  standardEngagementStateSchema,
} from "./engagement";

/**
 * Context-specific substep that resolves movement commands.
 *
 * This is a **context-specific substep** - it's tied to the `IssueCommandsPhase`.
 * It contains a composable substep:
 * - `EngagementState` (if movement results in engagement)
 *
 * Unlike composable substeps, this state is only used in one specific context.
 */
export interface MovementResolutionStateForBoard<TBoard extends Board> {
  /** The type of the substep. */
  substepType: "commandResolution";
  /** The type of command resolution. */
  commandResolutionType: "movement";
  /** The type of the board. */
  boardType: TBoard["boardType"];
  /** The unit that is moving. */
  movingUnit: UnitWithPlacement<TBoard>;
  /** The target placement of the movement. */
  targetPlacement: UnitPlacement<TBoard>;
  /** Whether to move the commander with the unit. */
  moveCommander: boolean;
  /** The commitment of the moving player. */
  commitment: Commitment;
  /** The engagement state of the movement. */
  engagementState: EngagementStateForBoard<TBoard> | undefined;
  /** Whether the movement resolution substep is complete. */
  completed: boolean;
}

export type MovementResolutionState =
  | MovementResolutionStateForBoard<SmallBoard>
  | MovementResolutionStateForBoard<StandardBoard>
  | MovementResolutionStateForBoard<LargeBoard>;

const _standardMovementResolutionStateSchemaObject = z.object({
  substepType: z.literal("commandResolution"),
  commandResolutionType: z.literal("movement"),
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  movingUnit: standardUnitWithPlacementSchema,
  targetPlacement: standardUnitPlacementSchema,
  moveCommander: z.boolean(),
  commitment: commitmentSchema,
  engagementState: standardEngagementStateSchema.or(z.undefined()),
  completed: z.boolean(),
});

type StandardMovementResolutionStateSchemaType = z.infer<
  typeof _standardMovementResolutionStateSchemaObject
>;

const _assertExactStandardMovementResolutionState: AssertExact<
  MovementResolutionStateForBoard<StandardBoard>,
  StandardMovementResolutionStateSchemaType
> = true;

export const standardMovementResolutionStateSchema: z.ZodType<
  MovementResolutionStateForBoard<StandardBoard>
> = _standardMovementResolutionStateSchemaObject;

const _smallMovementResolutionStateSchemaObject = z.object({
  substepType: z.literal("commandResolution"),
  commandResolutionType: z.literal("movement"),
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  movingUnit: smallUnitWithPlacementSchema,
  targetPlacement: smallUnitPlacementSchema,
  moveCommander: z.boolean(),
  commitment: commitmentSchema,
  engagementState: smallEngagementStateSchema.or(z.undefined()),
  completed: z.boolean(),
});

type SmallMovementResolutionStateSchemaType = z.infer<
  typeof _smallMovementResolutionStateSchemaObject
>;

const _assertExactSmallMovementResolutionState: AssertExact<
  MovementResolutionStateForBoard<SmallBoard>,
  SmallMovementResolutionStateSchemaType
> = true;

export const smallMovementResolutionStateSchema: z.ZodType<
  MovementResolutionStateForBoard<SmallBoard>
> = _smallMovementResolutionStateSchemaObject;

const _largeMovementResolutionStateSchemaObject = z.object({
  substepType: z.literal("commandResolution"),
  commandResolutionType: z.literal("movement"),
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  movingUnit: largeUnitWithPlacementSchema,
  targetPlacement: largeUnitPlacementSchema,
  moveCommander: z.boolean(),
  commitment: commitmentSchema,
  engagementState: largeEngagementStateSchema.or(z.undefined()),
  completed: z.boolean(),
});

type LargeMovementResolutionStateSchemaType = z.infer<
  typeof _largeMovementResolutionStateSchemaObject
>;

const _assertExactLargeMovementResolutionState: AssertExact<
  MovementResolutionStateForBoard<LargeBoard>,
  LargeMovementResolutionStateSchemaType
> = true;

export const largeMovementResolutionStateSchema: z.ZodType<
  MovementResolutionStateForBoard<LargeBoard>
> = _largeMovementResolutionStateSchemaObject;

const _movementResolutionStateSchemaObject = z.discriminatedUnion("boardType", [
  _standardMovementResolutionStateSchemaObject,
  _smallMovementResolutionStateSchemaObject,
  _largeMovementResolutionStateSchemaObject,
]);

type MovementResolutionStateSchemaType = z.infer<typeof _movementResolutionStateSchemaObject>;

const _assertExactMovementResolutionState: AssertExact<
  MovementResolutionState,
  MovementResolutionStateSchemaType
> = true;

/** Schema for movement resolution (any board) */
export const movementResolutionStateSchema: z.ZodType<MovementResolutionState> =
  _movementResolutionStateSchemaObject;
