import type {
  Board,
  LargeBoard,
  SmallBoard,
  StandardBoard,
  UnitFacing,
  UnitWithPlacement,
} from "@entities";
import type { AssertExact } from "@utils";
import type { ZodDiscriminatedUnion } from "zod";
import {
  largeUnitWithPlacementSchema,
  smallUnitWithPlacementSchema,
  standardUnitWithPlacementSchema,
  unitFacingSchema,
} from "@entities";
import { GAME_EFFECT_EVENT_TYPE } from "@events/eventTypeLiterals";
import { z } from "zod";

export const RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE = "resolveFlankEngagement" as const;

export interface ResolveFlankEngagementEventForBoard<TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE;
  /** The type of the board. */
  boardType: TBoard["boardType"];
  /** The defender with placement. */
  defenderWithPlacement: UnitWithPlacement<TBoard>;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The new facing of the defending unit. */
  newFacing: UnitFacing;
}

export type ResolveFlankEngagementEvent =
  | ResolveFlankEngagementEventForBoard<SmallBoard>
  | ResolveFlankEngagementEventForBoard<StandardBoard>
  | ResolveFlankEngagementEventForBoard<LargeBoard>;

const _standardResolveFlankEngagementEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  defenderWithPlacement: standardUnitWithPlacementSchema,
  newFacing: unitFacingSchema,
});

type StandardResolveFlankEngagementEventSchemaType = z.infer<
  typeof _standardResolveFlankEngagementEventSchemaObject
>;

const _assertExactStandardResolveFlankEngagementEvent: AssertExact<
  ResolveFlankEngagementEventForBoard<StandardBoard>,
  StandardResolveFlankEngagementEventSchemaType
> = true;

export const standardResolveFlankEngagementEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<"gameEffect">;
  effectType: z.ZodLiteral<"resolveFlankEngagement">;
  eventNumber: z.ZodNumber;
  boardType: z.ZodLiteral<"standard">;
  defenderWithPlacement: z.ZodType<
    UnitWithPlacement<StandardBoard>,
    unknown,
    z.core.$ZodTypeInternals<UnitWithPlacement<StandardBoard>, unknown>
  >;
  newFacing: z.ZodType<UnitFacing, unknown, z.core.$ZodTypeInternals<UnitFacing, unknown>>;
}> = _standardResolveFlankEngagementEventSchemaObject;

const _smallResolveFlankEngagementEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  defenderWithPlacement: smallUnitWithPlacementSchema,
  newFacing: unitFacingSchema,
});

type SmallResolveFlankEngagementEventSchemaType = z.infer<
  typeof _smallResolveFlankEngagementEventSchemaObject
>;

const _assertExactSmallResolveFlankEngagementEvent: AssertExact<
  ResolveFlankEngagementEventForBoard<SmallBoard>,
  SmallResolveFlankEngagementEventSchemaType
> = true;

export const smallResolveFlankEngagementEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<"gameEffect">;
  effectType: z.ZodLiteral<"resolveFlankEngagement">;
  eventNumber: z.ZodNumber;
  boardType: z.ZodLiteral<"small">;
  defenderWithPlacement: z.ZodType<
    UnitWithPlacement<SmallBoard>,
    unknown,
    z.core.$ZodTypeInternals<UnitWithPlacement<SmallBoard>, unknown>
  >;
  newFacing: z.ZodType<UnitFacing, unknown, z.core.$ZodTypeInternals<UnitFacing, unknown>>;
}> = _smallResolveFlankEngagementEventSchemaObject;

const _largeResolveFlankEngagementEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  defenderWithPlacement: largeUnitWithPlacementSchema,
  newFacing: unitFacingSchema,
});

type LargeResolveFlankEngagementEventSchemaType = z.infer<
  typeof _largeResolveFlankEngagementEventSchemaObject
>;

const _assertExactLargeResolveFlankEngagementEvent: AssertExact<
  ResolveFlankEngagementEventForBoard<LargeBoard>,
  LargeResolveFlankEngagementEventSchemaType
> = true;

export const largeResolveFlankEngagementEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<"gameEffect">;
  effectType: z.ZodLiteral<"resolveFlankEngagement">;
  eventNumber: z.ZodNumber;
  boardType: z.ZodLiteral<"large">;
  defenderWithPlacement: z.ZodType<
    UnitWithPlacement<LargeBoard>,
    unknown,
    z.core.$ZodTypeInternals<UnitWithPlacement<LargeBoard>, unknown>
  >;
  newFacing: z.ZodType<UnitFacing, unknown, z.core.$ZodTypeInternals<UnitFacing, unknown>>;
}> = _largeResolveFlankEngagementEventSchemaObject;

type _ResolveFlankEngagementEventDiscriminatedUnion = ZodDiscriminatedUnion<
  readonly [
    typeof _standardResolveFlankEngagementEventSchemaObject,
    typeof _smallResolveFlankEngagementEventSchemaObject,
    typeof _largeResolveFlankEngagementEventSchemaObject,
  ],
  "boardType"
>;

const _resolveFlankEngagementEventSchemaObject: _ResolveFlankEngagementEventDiscriminatedUnion =
  z.discriminatedUnion("boardType", [
    _standardResolveFlankEngagementEventSchemaObject,
    _smallResolveFlankEngagementEventSchemaObject,
    _largeResolveFlankEngagementEventSchemaObject,
  ]);

type ResolveFlankEngagementEventSchemaType = z.infer<
  typeof _resolveFlankEngagementEventSchemaObject
>;

const _assertExactResolveFlankEngagementEvent: AssertExact<
  ResolveFlankEngagementEvent,
  ResolveFlankEngagementEventSchemaType
> = true;

/** The schema for a resolve flank engagement event. */
export const resolveFlankEngagementEventSchema: z.ZodType<ResolveFlankEngagementEvent> =
  _resolveFlankEngagementEventSchemaObject;
