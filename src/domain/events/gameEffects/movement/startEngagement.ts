import type {
  Board,
  EngagementType,
  LargeBoard,
  SmallBoard,
  StandardBoard,
  UnitWithPlacement,
} from "@entities";
import type { AssertExact } from "@utils";
import type { ZodDiscriminatedUnion } from "zod";
import {
  engagementTypeSchema,
  largeUnitWithPlacementSchema,
  smallUnitWithPlacementSchema,
  standardUnitWithPlacementSchema,
} from "@entities";
import { GAME_EFFECT_EVENT_TYPE } from "@events/eventTypeLiterals";
import { z } from "zod";

/** The type of the start engagement game effect. */
export const START_ENGAGEMENT_EFFECT_TYPE = "startEngagement" as const;

export interface StartEngagementEventForBoard<TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof START_ENGAGEMENT_EFFECT_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The type of board. */
  boardType: TBoard["boardType"];
  /** The type of engagement. */
  engagementType: EngagementType;
  /** The defender with placement. */
  defenderWithPlacement: UnitWithPlacement<TBoard>;
}

export type StartEngagementEvent =
  | StartEngagementEventForBoard<StandardBoard>
  | StartEngagementEventForBoard<SmallBoard>
  | StartEngagementEventForBoard<LargeBoard>;

const _standardStartEngagementEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(START_ENGAGEMENT_EFFECT_TYPE),
  eventNumber: z.number(),
  engagementType: engagementTypeSchema,
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  defenderWithPlacement: standardUnitWithPlacementSchema,
});

type StandardStartEngagementEventSchemaType = z.infer<
  typeof _standardStartEngagementEventSchemaObject
>;

const _assertExactStandardStartEngagementEvent: AssertExact<
  StartEngagementEventForBoard<StandardBoard>,
  StandardStartEngagementEventSchemaType
> = true;

export const standardStartEngagementEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof START_ENGAGEMENT_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  engagementType: typeof engagementTypeSchema;
  boardType: z.ZodLiteral<"standard">;
  defenderWithPlacement: typeof standardUnitWithPlacementSchema;
}> = _standardStartEngagementEventSchemaObject;

const _smallStartEngagementEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(START_ENGAGEMENT_EFFECT_TYPE),
  eventNumber: z.number(),
  engagementType: engagementTypeSchema,
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  defenderWithPlacement: smallUnitWithPlacementSchema,
});

type SmallStartEngagementEventSchemaType = z.infer<typeof _smallStartEngagementEventSchemaObject>;

const _assertExactSmallStartEngagementEvent: AssertExact<
  StartEngagementEventForBoard<SmallBoard>,
  SmallStartEngagementEventSchemaType
> = true;

export const smallStartEngagementEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof START_ENGAGEMENT_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  engagementType: typeof engagementTypeSchema;
  boardType: z.ZodLiteral<"small">;
  defenderWithPlacement: typeof smallUnitWithPlacementSchema;
}> = _smallStartEngagementEventSchemaObject;

const _largeStartEngagementEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(START_ENGAGEMENT_EFFECT_TYPE),
  eventNumber: z.number(),
  engagementType: engagementTypeSchema,
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  defenderWithPlacement: largeUnitWithPlacementSchema,
});

type LargeStartEngagementEventSchemaType = z.infer<typeof _largeStartEngagementEventSchemaObject>;

const _assertExactLargeStartEngagementEvent: AssertExact<
  StartEngagementEventForBoard<LargeBoard>,
  LargeStartEngagementEventSchemaType
> = true;

export const largeStartEngagementEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof START_ENGAGEMENT_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  engagementType: typeof engagementTypeSchema;
  boardType: z.ZodLiteral<"large">;
  defenderWithPlacement: typeof largeUnitWithPlacementSchema;
}> = _largeStartEngagementEventSchemaObject;

type _StartEngagementEventDiscriminatedUnion = ZodDiscriminatedUnion<
  readonly [
    typeof _standardStartEngagementEventSchemaObject,
    typeof _smallStartEngagementEventSchemaObject,
    typeof _largeStartEngagementEventSchemaObject,
  ],
  "boardType"
>;

const _startEngagementEventSchemaObject: _StartEngagementEventDiscriminatedUnion =
  z.discriminatedUnion("boardType", [
    _standardStartEngagementEventSchemaObject,
    _smallStartEngagementEventSchemaObject,
    _largeStartEngagementEventSchemaObject,
  ]);

type StartEngagementEventSchemaType = z.infer<typeof _startEngagementEventSchemaObject>;

const _assertExactStartEngagementEvent: AssertExact<
  StartEngagementEvent,
  StartEngagementEventSchemaType
> = true;

/** The schema for a start engagement event. */
export const startEngagementEventSchema: ZodDiscriminatedUnion<
  readonly [
    z.ZodObject<{
      eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
      effectType: z.ZodLiteral<typeof START_ENGAGEMENT_EFFECT_TYPE>;
      eventNumber: z.ZodNumber;
      engagementType: typeof engagementTypeSchema;
      boardType: z.ZodLiteral<"standard">;
      defenderWithPlacement: typeof standardUnitWithPlacementSchema;
    }>,
    z.ZodObject<{
      eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
      effectType: z.ZodLiteral<typeof START_ENGAGEMENT_EFFECT_TYPE>;
      eventNumber: z.ZodNumber;
      engagementType: typeof engagementTypeSchema;
      boardType: z.ZodLiteral<"small">;
      defenderWithPlacement: typeof smallUnitWithPlacementSchema;
    }>,
    z.ZodObject<{
      eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
      effectType: z.ZodLiteral<typeof START_ENGAGEMENT_EFFECT_TYPE>;
      eventNumber: z.ZodNumber;
      engagementType: typeof engagementTypeSchema;
      boardType: z.ZodLiteral<"large">;
      defenderWithPlacement: typeof largeUnitWithPlacementSchema;
    }>,
  ],
  "boardType"
> = _startEngagementEventSchemaObject;
