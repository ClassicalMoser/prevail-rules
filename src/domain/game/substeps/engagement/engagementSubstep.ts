import type {
  Board,
  LargeBoard,
  SmallBoard,
  StandardBoard,
  UnitInstance,
  UnitPlacement,
} from "@entities";
import type { AssertExact } from "@utils";
import type { EngagementResolutionState } from "./engagementResolutionState";
import {
  largeUnitPlacementSchema,
  smallUnitPlacementSchema,
  standardUnitPlacementSchema,
  unitInstanceSchema,
} from "@entities";
import { z } from "zod";
import { engagementResolutionStateSchema } from "./engagementResolutionState";

/**
 * Composable substep that handles engagement resolution (flank, front, rear).
 *
 * This is a **composable substep** - it can be reused in multiple contexts:
 * - Used in `MovementResolutionState` (when movement results in engagement)
 *
 * It contains nested resolution logic that can trigger:
 * - `RoutState` (for rear engagements)
 * - Retreat logic (for front engagements)
 *
 * The expected event query `getExpectedEngagementEvent()` is composable and
 * can be called from any parent context that contains this state.
 */
export interface EngagementStateForBoard<TBoard extends Board> {
  /** The type of the substep. */
  substepType: "engagementResolution";
  /** The type of the board. */
  boardType: TBoard["boardType"];
  /** The unit that is engaging. */
  engagingUnit: UnitInstance;
  /** The target placement of the engagement. */
  targetPlacement: UnitPlacement<TBoard>;
  /** The resolution state of the engagement. */
  engagementResolutionState: EngagementResolutionState;
  /** Whether the engagement is complete. */
  completed: boolean;
}

export type EngagementState =
  | EngagementStateForBoard<SmallBoard>
  | EngagementStateForBoard<StandardBoard>
  | EngagementStateForBoard<LargeBoard>;

const _smallEngagementStateSchemaObject = z.object({
  substepType: z.literal("engagementResolution"),
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  engagingUnit: unitInstanceSchema,
  targetPlacement: smallUnitPlacementSchema,
  engagementResolutionState: engagementResolutionStateSchema,
  completed: z.boolean(),
});

type SmallEngagementStateSchemaType = z.infer<typeof _smallEngagementStateSchemaObject>;

const _assertExactSmallEngagementState: AssertExact<
  EngagementStateForBoard<SmallBoard>,
  SmallEngagementStateSchemaType
> = true;

export const smallEngagementStateSchema: z.ZodType<EngagementStateForBoard<SmallBoard>> =
  _smallEngagementStateSchemaObject;

const _standardEngagementStateSchemaObject = z.object({
  substepType: z.literal("engagementResolution"),
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  engagingUnit: unitInstanceSchema,
  targetPlacement: standardUnitPlacementSchema,
  engagementResolutionState: engagementResolutionStateSchema,
  completed: z.boolean(),
});

type StandardEngagementStateSchemaType = z.infer<typeof _standardEngagementStateSchemaObject>;

const _assertExactStandardEngagementState: AssertExact<
  EngagementStateForBoard<StandardBoard>,
  StandardEngagementStateSchemaType
> = true;

export const standardEngagementStateSchema: z.ZodType<EngagementStateForBoard<StandardBoard>> =
  _standardEngagementStateSchemaObject;

const _largeEngagementStateSchemaObject = z.object({
  substepType: z.literal("engagementResolution"),
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  engagingUnit: unitInstanceSchema,
  targetPlacement: largeUnitPlacementSchema,
  engagementResolutionState: engagementResolutionStateSchema,
  completed: z.boolean(),
});

type LargeEngagementStateSchemaType = z.infer<typeof _largeEngagementStateSchemaObject>;

const _assertExactLargeEngagementState: AssertExact<
  EngagementStateForBoard<LargeBoard>,
  LargeEngagementStateSchemaType
> = true;

export const largeEngagementStateSchema: z.ZodType<EngagementStateForBoard<LargeBoard>> =
  _largeEngagementStateSchemaObject;

const _engagementStateSchemaObject = z.discriminatedUnion("boardType", [
  _standardEngagementStateSchemaObject,
  _smallEngagementStateSchemaObject,
  _largeEngagementStateSchemaObject,
]);

type EngagementStateSchemaType = z.infer<typeof _engagementStateSchemaObject>;

const _assertExactEngagementState: AssertExact<EngagementState, EngagementStateSchemaType> = true;

export const engagementStateSchema: z.ZodType<EngagementState> = _engagementStateSchemaObject;
