import type { Board, LargeBoard, SmallBoard, StandardBoard, UnitWithPlacement } from "@entities";
import type { AssertExact } from "@utils";
import type { AttackResolutionContext } from "./attackResolutionContext";
import {
  largeUnitWithPlacementSchema,
  smallUnitWithPlacementSchema,
  standardUnitWithPlacementSchema,
} from "@entities";

import { GAME_EFFECT_EVENT_TYPE } from "@events/eventTypeLiterals";
import { z } from "zod";
import { attackResolutionContextSchema } from "./attackResolutionContext";

/** The type of the resolve reverse game effect. */
export const RESOLVE_REVERSE_EFFECT_TYPE = "resolveReverse" as const;

export interface ResolveReverseEventForBoard<TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_REVERSE_EFFECT_TYPE;
  /** The type of the board. */
  boardType: TBoard["boardType"];
  /** The unit instance that is being reversed. */
  unitInstance: UnitWithPlacement<TBoard>;
  /** The new unit placement after the reverse. */
  newUnitPlacement: UnitWithPlacement<TBoard>;
  /**
   * Ranged vs melee attack-resolution path holding this reverse.
   * Set by `generateResolveReverseEvent` in `src/domain/procedures/`.
   */
  attackResolutionContext: AttackResolutionContext;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
}

export type ResolveReverseEvent =
  | ResolveReverseEventForBoard<SmallBoard>
  | ResolveReverseEventForBoard<StandardBoard>
  | ResolveReverseEventForBoard<LargeBoard>;

const _standardResolveReverseEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof RESOLVE_REVERSE_EFFECT_TYPE>;
  attackResolutionContext: typeof attackResolutionContextSchema;
  eventNumber: z.ZodNumber;
  boardType: z.ZodLiteral<"standard">;
  unitInstance: typeof standardUnitWithPlacementSchema;
  newUnitPlacement: typeof standardUnitWithPlacementSchema;
}> = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_REVERSE_EFFECT_TYPE),
  attackResolutionContext: attackResolutionContextSchema,
  eventNumber: z.number(),
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  unitInstance: standardUnitWithPlacementSchema,
  newUnitPlacement: standardUnitWithPlacementSchema,
});

type StandardResolveReverseEventSchemaType = z.infer<
  typeof _standardResolveReverseEventSchemaObject
>;

const _assertExactStandardResolveReverseEvent: AssertExact<
  ResolveReverseEventForBoard<StandardBoard>,
  StandardResolveReverseEventSchemaType
> = true;

export const standardResolveReverseEventSchema: typeof _standardResolveReverseEventSchemaObject =
  _standardResolveReverseEventSchemaObject;

const _smallResolveReverseEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof RESOLVE_REVERSE_EFFECT_TYPE>;
  attackResolutionContext: typeof attackResolutionContextSchema;
  eventNumber: z.ZodNumber;
  boardType: z.ZodLiteral<"small">;
  unitInstance: typeof smallUnitWithPlacementSchema;
  newUnitPlacement: typeof smallUnitWithPlacementSchema;
}> = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_REVERSE_EFFECT_TYPE),
  attackResolutionContext: attackResolutionContextSchema,
  eventNumber: z.number(),
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  unitInstance: smallUnitWithPlacementSchema,
  newUnitPlacement: smallUnitWithPlacementSchema,
});

type SmallResolveReverseEventSchemaType = z.infer<typeof _smallResolveReverseEventSchemaObject>;

const _assertExactSmallResolveReverseEvent: AssertExact<
  ResolveReverseEventForBoard<SmallBoard>,
  SmallResolveReverseEventSchemaType
> = true;

export const smallResolveReverseEventSchema: typeof _smallResolveReverseEventSchemaObject =
  _smallResolveReverseEventSchemaObject;

const _largeResolveReverseEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof RESOLVE_REVERSE_EFFECT_TYPE>;
  attackResolutionContext: typeof attackResolutionContextSchema;
  eventNumber: z.ZodNumber;
  boardType: z.ZodLiteral<"large">;
  unitInstance: typeof largeUnitWithPlacementSchema;
  newUnitPlacement: typeof largeUnitWithPlacementSchema;
}> = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_REVERSE_EFFECT_TYPE),
  attackResolutionContext: attackResolutionContextSchema,
  eventNumber: z.number(),
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  unitInstance: largeUnitWithPlacementSchema,
  newUnitPlacement: largeUnitWithPlacementSchema,
});

type LargeResolveReverseEventSchemaType = z.infer<typeof _largeResolveReverseEventSchemaObject>;

const _assertExactLargeResolveReverseEvent: AssertExact<
  ResolveReverseEventForBoard<LargeBoard>,
  LargeResolveReverseEventSchemaType
> = true;

export const largeResolveReverseEventSchema: typeof _largeResolveReverseEventSchemaObject =
  _largeResolveReverseEventSchemaObject;

const _resolveReverseEventSchemaObject: z.ZodType<ResolveReverseEvent> = z.discriminatedUnion(
  "boardType",
  [
    _standardResolveReverseEventSchemaObject,
    _smallResolveReverseEventSchemaObject,
    _largeResolveReverseEventSchemaObject,
  ],
);

type ResolveReverseEventSchemaType = z.infer<typeof _resolveReverseEventSchemaObject>;

const _assertExactResolveReverseEvent: AssertExact<
  ResolveReverseEvent,
  ResolveReverseEventSchemaType
> = true;

/** The schema for a resolve reverse event. */
export const resolveReverseEventSchema: typeof _resolveReverseEventSchemaObject =
  _resolveReverseEventSchemaObject;
