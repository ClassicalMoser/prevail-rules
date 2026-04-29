import type { BoardCoordinate, LargeBoard, SmallBoard, StandardBoard } from "@entities";

import type {
  LargeMeleeResolutionState,
  SmallMeleeResolutionState,
  StandardMeleeResolutionState,
} from "@game/substeps";
import type { AssertExact } from "@utils";
import {
  largeBoardCoordinateSchema,
  smallBoardCoordinateSchema,
  standardBoardCoordinateSchema,
} from "@entities";
import {
  largeMeleeResolutionStateSchema,
  smallMeleeResolutionStateSchema,
  standardMeleeResolutionStateSchema,
} from "@game/substeps";
import { z } from "zod";

/** Iterable list of valid steps in the resolve melee phase. */
export const resolveMeleePhaseSteps = [
  /** Most complex step: Loop through remaining engagements and expect resolve melee events */
  "resolveMelee",
  /** Expect single gameEffect: advance to cleanup phase */
  "complete",
] as const;

/** The step of the resolve melee phase. */
export type ResolveMeleePhaseStep = (typeof resolveMeleePhaseSteps)[number];

const _resolveMeleePhaseStepSchemaObject = z.enum(resolveMeleePhaseSteps);
type ResolveMeleePhaseStepSchemaType = z.infer<typeof _resolveMeleePhaseStepSchemaObject>;

/** The schema for the step of the resolve melee phase. */
export const resolveMeleePhaseStepSchema: z.ZodType<ResolveMeleePhaseStep> =
  _resolveMeleePhaseStepSchemaObject;

const _assertExactResolveMeleePhaseStep: AssertExact<
  ResolveMeleePhaseStep,
  ResolveMeleePhaseStepSchemaType
> = true;

/** The state of the resolve melee phase. */
export interface ResolveMeleePhaseStateBase {
  /** The current phase of the round. */
  phase: "resolveMelee";
  /** The step of the resolve melee phase. */
  step: ResolveMeleePhaseStep;
}

export interface StandardResolveMeleePhaseState extends ResolveMeleePhaseStateBase {
  boardType: "standard";
  currentMeleeResolutionState: StandardMeleeResolutionState | undefined;
  remainingEngagements: Set<BoardCoordinate<StandardBoard>>;
}

export interface SmallResolveMeleePhaseState extends ResolveMeleePhaseStateBase {
  boardType: "small";
  currentMeleeResolutionState: SmallMeleeResolutionState | undefined;
  remainingEngagements: Set<BoardCoordinate<SmallBoard>>;
}

export interface LargeResolveMeleePhaseState extends ResolveMeleePhaseStateBase {
  boardType: "large";
  currentMeleeResolutionState: LargeMeleeResolutionState | undefined;
  remainingEngagements: Set<BoardCoordinate<LargeBoard>>;
}

export type ResolveMeleePhaseState =
  | StandardResolveMeleePhaseState
  | SmallResolveMeleePhaseState
  | LargeResolveMeleePhaseState;

const _standardResolveMeleePhaseStateSchemaObject = z.object({
  phase: z.literal("resolveMelee"),
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  step: _resolveMeleePhaseStepSchemaObject,
  currentMeleeResolutionState: standardMeleeResolutionStateSchema.or(z.undefined()),
  remainingEngagements: z.set(standardBoardCoordinateSchema),
});

type StandardResolveMeleePhaseStateSchemaType = z.infer<
  typeof _standardResolveMeleePhaseStateSchemaObject
>;

const _assertExactStandardResolveMeleePhaseState: AssertExact<
  StandardResolveMeleePhaseState,
  StandardResolveMeleePhaseStateSchemaType
> = true;

export const standardResolveMeleePhaseStateSchema: z.ZodType<StandardResolveMeleePhaseState> =
  _standardResolveMeleePhaseStateSchemaObject;

const _smallResolveMeleePhaseStateSchemaObject = z.object({
  phase: z.literal("resolveMelee"),
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  step: _resolveMeleePhaseStepSchemaObject,
  currentMeleeResolutionState: smallMeleeResolutionStateSchema.or(z.undefined()),
  remainingEngagements: z.set(smallBoardCoordinateSchema),
});

type SmallResolveMeleePhaseStateSchemaType = z.infer<
  typeof _smallResolveMeleePhaseStateSchemaObject
>;

const _assertExactSmallResolveMeleePhaseState: AssertExact<
  SmallResolveMeleePhaseState,
  SmallResolveMeleePhaseStateSchemaType
> = true;

export const smallResolveMeleePhaseStateSchema: z.ZodType<SmallResolveMeleePhaseState> =
  _smallResolveMeleePhaseStateSchemaObject;

const _largeResolveMeleePhaseStateSchemaObject = z.object({
  phase: z.literal("resolveMelee"),
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  step: _resolveMeleePhaseStepSchemaObject,
  currentMeleeResolutionState: largeMeleeResolutionStateSchema.or(z.undefined()),
  remainingEngagements: z.set(largeBoardCoordinateSchema),
});

type LargeResolveMeleePhaseStateSchemaType = z.infer<
  typeof _largeResolveMeleePhaseStateSchemaObject
>;

const _assertExactLargeResolveMeleePhaseState: AssertExact<
  LargeResolveMeleePhaseState,
  LargeResolveMeleePhaseStateSchemaType
> = true;

export const largeResolveMeleePhaseStateSchema: z.ZodType<LargeResolveMeleePhaseState> =
  _largeResolveMeleePhaseStateSchemaObject;

const _resolveMeleePhaseStateSchemaObject = z.union([
  _standardResolveMeleePhaseStateSchemaObject,
  _smallResolveMeleePhaseStateSchemaObject,
  _largeResolveMeleePhaseStateSchemaObject,
]);

/** Schema for resolve-melee phase state (any board). Per-variant AssertExact above; wide union not asserted. */
export const resolveMeleePhaseStateSchema: z.ZodType<ResolveMeleePhaseState> =
  _resolveMeleePhaseStateSchemaObject;
