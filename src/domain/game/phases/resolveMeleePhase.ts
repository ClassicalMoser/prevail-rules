import type { Board, BoardCoordinate, LargeBoard, SmallBoard, StandardBoard } from "@entities";

import type { MeleeResolutionStateForBoard } from "@game/substeps";
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
export interface ResolveMeleePhaseStateForBoard<TBoard extends Board> {
  /** The current phase of the round. */
  phase: "resolveMelee";
  /** The type of the board. */
  boardType: TBoard["boardType"];
  /** The step of the resolve melee phase. */
  step: ResolveMeleePhaseStep;
  /** The current melee resolution state. */
  currentMeleeResolutionState: MeleeResolutionStateForBoard<TBoard> | undefined;
  /** The remaining engagements. */
  remainingEngagements: Set<BoardCoordinate<TBoard>>;
}

export type ResolveMeleePhaseState =
  | ResolveMeleePhaseStateForBoard<SmallBoard>
  | ResolveMeleePhaseStateForBoard<StandardBoard>
  | ResolveMeleePhaseStateForBoard<LargeBoard>;

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
  ResolveMeleePhaseStateForBoard<StandardBoard>,
  StandardResolveMeleePhaseStateSchemaType
> = true;

export const standardResolveMeleePhaseStateSchema: z.ZodType<
  ResolveMeleePhaseStateForBoard<StandardBoard>
> = _standardResolveMeleePhaseStateSchemaObject;

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
  ResolveMeleePhaseStateForBoard<SmallBoard>,
  SmallResolveMeleePhaseStateSchemaType
> = true;

export const smallResolveMeleePhaseStateSchema: z.ZodType<
  ResolveMeleePhaseStateForBoard<SmallBoard>
> = _smallResolveMeleePhaseStateSchemaObject;

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
  ResolveMeleePhaseStateForBoard<LargeBoard>,
  LargeResolveMeleePhaseStateSchemaType
> = true;

export const largeResolveMeleePhaseStateSchema: z.ZodType<
  ResolveMeleePhaseStateForBoard<LargeBoard>
> = _largeResolveMeleePhaseStateSchemaObject;

const _resolveMeleePhaseStateSchemaObject = z.union([
  _standardResolveMeleePhaseStateSchemaObject,
  _smallResolveMeleePhaseStateSchemaObject,
  _largeResolveMeleePhaseStateSchemaObject,
]);

/** Schema for resolve-melee phase state (any board). Per-variant AssertExact above; wide union not asserted. */
export const resolveMeleePhaseStateSchema: z.ZodType<ResolveMeleePhaseState> =
  _resolveMeleePhaseStateSchemaObject;
