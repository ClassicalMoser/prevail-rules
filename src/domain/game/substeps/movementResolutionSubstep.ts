import type {
  LargeBoard,
  SmallBoard,
  StandardBoard,
  UnitPlacement,
  UnitWithPlacement,
} from "@entities";
import type { Commitment } from "@game/commitment";
import type { AssertExact } from "@utils";
import type {
  LargeEngagementState,
  SmallEngagementState,
  StandardEngagementState,
} from "./engagement";
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
export interface MovementResolutionStateBase {
  /** The type of the substep. */
  substepType: "commandResolution";
  /** The type of command resolution. */
  commandResolutionType: "movement";
  /** Whether to move the commander with the unit. */
  moveCommander: boolean;
  /** The commitment of the moving player. */
  commitment: Commitment;
  /** Whether the movement resolution substep is complete. */
  completed: boolean;
}

export interface StandardMovementResolutionState extends MovementResolutionStateBase {
  boardType: "standard";
  movingUnit: UnitWithPlacement<StandardBoard>;
  targetPlacement: UnitPlacement<StandardBoard>;
  engagementState: StandardEngagementState | undefined;
}

export interface SmallMovementResolutionState extends MovementResolutionStateBase {
  boardType: "small";
  movingUnit: UnitWithPlacement<SmallBoard>;
  targetPlacement: UnitPlacement<SmallBoard>;
  engagementState: SmallEngagementState | undefined;
}

export interface LargeMovementResolutionState extends MovementResolutionStateBase {
  boardType: "large";
  movingUnit: UnitWithPlacement<LargeBoard>;
  targetPlacement: UnitPlacement<LargeBoard>;
  engagementState: LargeEngagementState | undefined;
}

export type MovementResolutionState =
  | StandardMovementResolutionState
  | SmallMovementResolutionState
  | LargeMovementResolutionState;

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
  StandardMovementResolutionState,
  StandardMovementResolutionStateSchemaType
> = true;

export const standardMovementResolutionStateSchema: z.ZodType<StandardMovementResolutionState> =
  _standardMovementResolutionStateSchemaObject;

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
  SmallMovementResolutionState,
  SmallMovementResolutionStateSchemaType
> = true;

export const smallMovementResolutionStateSchema: z.ZodType<SmallMovementResolutionState> =
  _smallMovementResolutionStateSchemaObject;

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
  LargeMovementResolutionState,
  LargeMovementResolutionStateSchemaType
> = true;

export const largeMovementResolutionStateSchema: z.ZodType<LargeMovementResolutionState> =
  _largeMovementResolutionStateSchemaObject;

const _movementResolutionStateSchemaObject = z.discriminatedUnion("boardType", [
  _standardMovementResolutionStateSchemaObject,
  _smallMovementResolutionStateSchemaObject,
  _largeMovementResolutionStateSchemaObject,
]);

/** Schema for movement resolution (any board). Per-variant AssertExact above; wide union not asserted. */
export const movementResolutionStateSchema: z.ZodType<MovementResolutionState> =
  _movementResolutionStateSchemaObject;
