import type { Board, BoardCoordinate, LargeBoard, SmallBoard, StandardBoard } from "@entities";
import type { AssertExact } from "@utils";
import type { ZodDiscriminatedUnion } from "zod";
import {
  largeBoardCoordinateSchema,
  smallBoardCoordinateSchema,
  standardBoardCoordinateSchema,
} from "@entities";
import { GAME_EFFECT_EVENT_TYPE } from "@events/eventTypeLiterals";
import { z } from "zod";

/**
 * Literal discriminator for {@link CompleteIssueCommandsPhaseEvent.effectType}.
 *
 * Phase transition: issue commands → resolve melee. `remainingEngagements` is a board-derived
 * snapshot so apply does not scan for engaged coordinates at transition time.
 */
export const COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE = "completeIssueCommandsPhase" as const;

export interface CompleteIssueCommandsPhaseEventForBoard<TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE;
  /** The type of the board. */
  boardType: TBoard["boardType"];
  /** The remaining engagements. */
  remainingEngagements: Set<BoardCoordinate<TBoard>>;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
}

export type CompleteIssueCommandsPhaseEvent =
  | CompleteIssueCommandsPhaseEventForBoard<SmallBoard>
  | CompleteIssueCommandsPhaseEventForBoard<StandardBoard>
  | CompleteIssueCommandsPhaseEventForBoard<LargeBoard>;

const _standardCompleteIssueCommandsPhaseEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  boardType: z.ZodLiteral<"standard">;
  remainingEngagements: z.ZodSet<typeof standardBoardCoordinateSchema>;
}> = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  remainingEngagements: z.set(standardBoardCoordinateSchema),
});

type StandardCompleteIssueCommandsPhaseEventSchemaType = z.infer<
  typeof _standardCompleteIssueCommandsPhaseEventSchemaObject
>;

const _assertExactStandardCompleteIssueCommandsPhaseEvent: AssertExact<
  CompleteIssueCommandsPhaseEventForBoard<StandardBoard>,
  StandardCompleteIssueCommandsPhaseEventSchemaType
> = true;

export const standardCompleteIssueCommandsPhaseEventSchema: typeof _standardCompleteIssueCommandsPhaseEventSchemaObject =
  _standardCompleteIssueCommandsPhaseEventSchemaObject;

const _smallCompleteIssueCommandsPhaseEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  boardType: z.ZodLiteral<"small">;
  remainingEngagements: z.ZodSet<typeof smallBoardCoordinateSchema>;
}> = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  remainingEngagements: z.set(smallBoardCoordinateSchema),
});

type SmallCompleteIssueCommandsPhaseEventSchemaType = z.infer<
  typeof _smallCompleteIssueCommandsPhaseEventSchemaObject
>;

const _assertExactSmallCompleteIssueCommandsPhaseEvent: AssertExact<
  CompleteIssueCommandsPhaseEventForBoard<SmallBoard>,
  SmallCompleteIssueCommandsPhaseEventSchemaType
> = true;

export const smallCompleteIssueCommandsPhaseEventSchema: typeof _smallCompleteIssueCommandsPhaseEventSchemaObject =
  _smallCompleteIssueCommandsPhaseEventSchemaObject;

const _largeCompleteIssueCommandsPhaseEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  boardType: z.ZodLiteral<"large">;
  remainingEngagements: z.ZodSet<typeof largeBoardCoordinateSchema>;
}> = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(COMPLETE_ISSUE_COMMANDS_PHASE_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  remainingEngagements: z.set(largeBoardCoordinateSchema),
});

type LargeCompleteIssueCommandsPhaseEventSchemaType = z.infer<
  typeof _largeCompleteIssueCommandsPhaseEventSchemaObject
>;

const _assertExactLargeCompleteIssueCommandsPhaseEvent: AssertExact<
  CompleteIssueCommandsPhaseEventForBoard<LargeBoard>,
  LargeCompleteIssueCommandsPhaseEventSchemaType
> = true;

export const largeCompleteIssueCommandsPhaseEventSchema: typeof _largeCompleteIssueCommandsPhaseEventSchemaObject =
  _largeCompleteIssueCommandsPhaseEventSchemaObject;

type _CompleteIssueCommandsPhaseEventDiscriminatedUnion = ZodDiscriminatedUnion<
  readonly [
    typeof _standardCompleteIssueCommandsPhaseEventSchemaObject,
    typeof _smallCompleteIssueCommandsPhaseEventSchemaObject,
    typeof _largeCompleteIssueCommandsPhaseEventSchemaObject,
  ],
  "boardType"
>;

const _completeIssueCommandsPhaseEventSchemaObject: _CompleteIssueCommandsPhaseEventDiscriminatedUnion =
  z.discriminatedUnion("boardType", [
    _standardCompleteIssueCommandsPhaseEventSchemaObject,
    _smallCompleteIssueCommandsPhaseEventSchemaObject,
    _largeCompleteIssueCommandsPhaseEventSchemaObject,
  ]);

type CompleteIssueCommandsPhaseEventSchemaType = z.infer<
  typeof _completeIssueCommandsPhaseEventSchemaObject
>;

const _assertExactCompleteIssueCommandsPhaseEvent: AssertExact<
  CompleteIssueCommandsPhaseEvent,
  CompleteIssueCommandsPhaseEventSchemaType
> = true;

/** The schema for a complete issue commands phase event. */
export const completeIssueCommandsPhaseEventSchema: typeof _completeIssueCommandsPhaseEventSchemaObject =
  _completeIssueCommandsPhaseEventSchemaObject;
