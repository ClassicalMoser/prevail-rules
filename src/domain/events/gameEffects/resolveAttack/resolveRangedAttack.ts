import type {
  Board,
  LargeBoard,
  SmallBoard,
  StandardBoard,
  UnitPlacement,
  UnitWithPlacement,
} from "@entities";
import type { AssertExact } from "@utils";
import type { ZodDiscriminatedUnion } from "zod";
import {
  largeUnitPlacementSchema,
  largeUnitWithPlacementSchema,
  smallUnitPlacementSchema,
  smallUnitWithPlacementSchema,
  standardUnitPlacementSchema,
  standardUnitWithPlacementSchema,
} from "@entities";
import { GAME_EFFECT_EVENT_TYPE } from "@events/eventTypeLiterals";
import { z } from "zod";

/** The type of the resolve ranged attack game effect. */
export const RESOLVE_RANGED_ATTACK_EFFECT_TYPE = "resolveRangedAttack" as const;

export interface ResolveRangedAttackEventForBoard<TBoard extends Board> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_RANGED_ATTACK_EFFECT_TYPE;
  /** The type of the board. */
  boardType: TBoard["boardType"];
  /** Whether the unit is routed. */
  routed: boolean;
  /** Whether the unit is reversed. */
  reversed: boolean;
  /** Whether the unit is retreated. */
  retreated: boolean;
  /** The defender with placement. */
  defenderWithPlacement: UnitWithPlacement<TBoard>;
  /** The legal retreat options. */
  legalRetreatOptions: Set<UnitPlacement<TBoard>>;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
}

export type ResolveRangedAttackEvent =
  | ResolveRangedAttackEventForBoard<StandardBoard>
  | ResolveRangedAttackEventForBoard<SmallBoard>
  | ResolveRangedAttackEventForBoard<LargeBoard>;

const _standardResolveRangedAttackEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof RESOLVE_RANGED_ATTACK_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  boardType: z.ZodLiteral<"standard">;
  defenderWithPlacement: typeof standardUnitWithPlacementSchema;
  legalRetreatOptions: z.ZodSet<typeof standardUnitPlacementSchema>;
  routed: z.ZodBoolean;
  reversed: z.ZodBoolean;
  retreated: z.ZodBoolean;
}> = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_RANGED_ATTACK_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal("standard" satisfies StandardBoard["boardType"]),
  defenderWithPlacement: standardUnitWithPlacementSchema,
  legalRetreatOptions: z.set(standardUnitPlacementSchema),
  routed: z.boolean(),
  reversed: z.boolean(),
  retreated: z.boolean(),
});

type StandardResolveRangedAttackEventSchemaType = z.infer<
  typeof _standardResolveRangedAttackEventSchemaObject
>;

const _assertExactStandardResolveRangedAttackEvent: AssertExact<
  ResolveRangedAttackEventForBoard<StandardBoard>,
  StandardResolveRangedAttackEventSchemaType
> = true;

export const standardResolveRangedAttackEventSchema: typeof _standardResolveRangedAttackEventSchemaObject =
  _standardResolveRangedAttackEventSchemaObject;

const _smallResolveRangedAttackEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof RESOLVE_RANGED_ATTACK_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  boardType: z.ZodLiteral<"small">;
  defenderWithPlacement: typeof smallUnitWithPlacementSchema;
  legalRetreatOptions: z.ZodSet<typeof smallUnitPlacementSchema>;
  routed: z.ZodBoolean;
  reversed: z.ZodBoolean;
  retreated: z.ZodBoolean;
}> = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_RANGED_ATTACK_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal("small" satisfies SmallBoard["boardType"]),
  defenderWithPlacement: smallUnitWithPlacementSchema,
  legalRetreatOptions: z.set(smallUnitPlacementSchema),
  routed: z.boolean(),
  reversed: z.boolean(),
  retreated: z.boolean(),
});

type SmallResolveRangedAttackEventSchemaType = z.infer<
  typeof _smallResolveRangedAttackEventSchemaObject
>;

const _assertExactSmallResolveRangedAttackEvent: AssertExact<
  ResolveRangedAttackEventForBoard<SmallBoard>,
  SmallResolveRangedAttackEventSchemaType
> = true;

export const smallResolveRangedAttackEventSchema: typeof _smallResolveRangedAttackEventSchemaObject =
  _smallResolveRangedAttackEventSchemaObject;

const _largeResolveRangedAttackEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof RESOLVE_RANGED_ATTACK_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  boardType: z.ZodLiteral<"large">;
  defenderWithPlacement: typeof largeUnitWithPlacementSchema;
  legalRetreatOptions: z.ZodSet<typeof largeUnitPlacementSchema>;
  routed: z.ZodBoolean;
  reversed: z.ZodBoolean;
  retreated: z.ZodBoolean;
}> = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_RANGED_ATTACK_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal("large" satisfies LargeBoard["boardType"]),
  defenderWithPlacement: largeUnitWithPlacementSchema,
  legalRetreatOptions: z.set(largeUnitPlacementSchema),
  routed: z.boolean(),
  reversed: z.boolean(),
  retreated: z.boolean(),
});

type LargeResolveRangedAttackEventSchemaType = z.infer<
  typeof _largeResolveRangedAttackEventSchemaObject
>;

const _assertExactLargeResolveRangedAttackEvent: AssertExact<
  ResolveRangedAttackEventForBoard<LargeBoard>,
  LargeResolveRangedAttackEventSchemaType
> = true;

export const largeResolveRangedAttackEventSchema: typeof _largeResolveRangedAttackEventSchemaObject =
  _largeResolveRangedAttackEventSchemaObject;

type _ResolveRangedAttackEventDiscriminatedUnion = ZodDiscriminatedUnion<
  readonly [
    typeof _standardResolveRangedAttackEventSchemaObject,
    typeof _smallResolveRangedAttackEventSchemaObject,
    typeof _largeResolveRangedAttackEventSchemaObject,
  ],
  "boardType"
>;

const _resolveRangedAttackEventSchemaObject: _ResolveRangedAttackEventDiscriminatedUnion =
  z.discriminatedUnion("boardType", [
    _standardResolveRangedAttackEventSchemaObject,
    _smallResolveRangedAttackEventSchemaObject,
    _largeResolveRangedAttackEventSchemaObject,
  ]);

type ResolveRangedAttackEventSchemaType = z.infer<typeof _resolveRangedAttackEventSchemaObject>;

const _assertExactResolveRangedAttackEvent: AssertExact<
  ResolveRangedAttackEvent,
  ResolveRangedAttackEventSchemaType
> = true;

/** The schema for a resolve ranged attack event. */
export const resolveRangedAttackEventSchema: typeof _resolveRangedAttackEventSchemaObject =
  _resolveRangedAttackEventSchemaObject;
