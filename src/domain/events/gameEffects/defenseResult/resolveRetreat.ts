import type { Board, LargeBoard, SmallBoard, StandardBoard, UnitWithPlacement } from "@entities";
import type { AssertExact } from "@utils";

import type { ZodDiscriminatedUnion } from "zod";
import {
  largeUnitWithPlacementSchema,
  smallUnitWithPlacementSchema,
  standardUnitWithPlacementSchema,
} from "@entities";
import { GAME_EFFECT_EVENT_TYPE } from "@events/eventTypeLiterals";
import { z } from "zod";

/** The type of the resolve retreat game effect. */
export const RESOLVE_RETREAT_EFFECT_TYPE = "resolveRetreat" as const;

export interface ResolveRetreatEventForBoard<TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_RETREAT_EFFECT_TYPE;
  /** The type of the board. */
  boardType: TBoard["boardType"];
  /** The starting position of the unit. */
  startingPosition: UnitWithPlacement<TBoard>;
  /** The final position of the unit. */
  finalPosition: UnitWithPlacement<TBoard>;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
}

export type ResolveRetreatEvent =
  | ResolveRetreatEventForBoard<SmallBoard>
  | ResolveRetreatEventForBoard<StandardBoard>
  | ResolveRetreatEventForBoard<LargeBoard>;

const _smallResolveRetreatEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof RESOLVE_RETREAT_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  boardType: z.ZodLiteral<"small">;
  startingPosition: typeof smallUnitWithPlacementSchema;
  finalPosition: typeof smallUnitWithPlacementSchema;
}> = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_RETREAT_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  startingPosition: smallUnitWithPlacementSchema,
  finalPosition: smallUnitWithPlacementSchema,
});

type SmallResolveRetreatEventSchemaType = z.infer<typeof _smallResolveRetreatEventSchemaObject>;

const _assertExactSmallResolveRetreatEvent: AssertExact<
  ResolveRetreatEventForBoard<SmallBoard>,
  SmallResolveRetreatEventSchemaType
> = true;

export const smallResolveRetreatEventSchema: typeof _smallResolveRetreatEventSchemaObject =
  _smallResolveRetreatEventSchemaObject;

const _standardResolveRetreatEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof RESOLVE_RETREAT_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  boardType: z.ZodLiteral<"standard">;
  startingPosition: typeof standardUnitWithPlacementSchema;
  finalPosition: typeof standardUnitWithPlacementSchema;
}> = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_RETREAT_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  startingPosition: standardUnitWithPlacementSchema,
  finalPosition: standardUnitWithPlacementSchema,
});

type StandardResolveRetreatEventSchemaType = z.infer<
  typeof _standardResolveRetreatEventSchemaObject
>;

const _assertExactStandardResolveRetreatEvent: AssertExact<
  ResolveRetreatEventForBoard<StandardBoard>,
  StandardResolveRetreatEventSchemaType
> = true;

export const standardResolveRetreatEventSchema: typeof _standardResolveRetreatEventSchemaObject =
  _standardResolveRetreatEventSchemaObject;

const _largeResolveRetreatEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof RESOLVE_RETREAT_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  boardType: z.ZodLiteral<"large">;
  startingPosition: typeof largeUnitWithPlacementSchema;
  finalPosition: typeof largeUnitWithPlacementSchema;
}> = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_RETREAT_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  startingPosition: largeUnitWithPlacementSchema,
  finalPosition: largeUnitWithPlacementSchema,
});

type LargeResolveRetreatEventSchemaType = z.infer<typeof _largeResolveRetreatEventSchemaObject>;

const _assertExactLargeResolveRetreatEvent: AssertExact<
  ResolveRetreatEventForBoard<LargeBoard>,
  LargeResolveRetreatEventSchemaType
> = true;

export const largeResolveRetreatEventSchema: typeof _largeResolveRetreatEventSchemaObject =
  _largeResolveRetreatEventSchemaObject;

type _ResolveRetreatEventDiscriminatedUnion = ZodDiscriminatedUnion<
  readonly [
    typeof _standardResolveRetreatEventSchemaObject,
    typeof _smallResolveRetreatEventSchemaObject,
    typeof _largeResolveRetreatEventSchemaObject,
  ],
  "boardType"
>;

const _resolveRetreatEventSchemaObject: _ResolveRetreatEventDiscriminatedUnion =
  z.discriminatedUnion("boardType", [
    _standardResolveRetreatEventSchemaObject,
    _smallResolveRetreatEventSchemaObject,
    _largeResolveRetreatEventSchemaObject,
  ]);

type ResolveRetreatEventSchemaType = z.infer<typeof _resolveRetreatEventSchemaObject>;

const _assertExactResolveRetreatEvent: AssertExact<
  ResolveRetreatEvent,
  ResolveRetreatEventSchemaType
> = true;

/** The schema for a resolve retreat event. */
export const resolveRetreatEventSchema: typeof _resolveRetreatEventSchemaObject =
  _resolveRetreatEventSchemaObject;
