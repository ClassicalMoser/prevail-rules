import type {
  Board,
  LargeBoard,
  LargeUnitWithPlacement,
  SmallBoard,
  SmallUnitWithPlacement,
  StandardBoard,
  StandardUnitWithPlacement,
  UnitFacing,
} from '@entities';
import type { AssertExact } from '@utils';
import {
  largeUnitWithPlacementSchema,
  smallUnitWithPlacementSchema,
  standardUnitWithPlacementSchema,
  unitFacingSchema,
} from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

export const RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE =
  'resolveFlankEngagement' as const;

interface ResolveFlankEngagementEventBase {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The new facing of the defending unit. */
  newFacing: UnitFacing;
}

/**
 * Completes flank engagement by rotating the defender to face the attacker.
 */
export interface StandardResolveFlankEngagementEvent extends ResolveFlankEngagementEventBase {
  boardType: 'standard';
  defenderWithPlacement: StandardUnitWithPlacement;
}

export interface SmallResolveFlankEngagementEvent extends ResolveFlankEngagementEventBase {
  boardType: 'small';
  defenderWithPlacement: SmallUnitWithPlacement;
}

export interface LargeResolveFlankEngagementEvent extends ResolveFlankEngagementEventBase {
  boardType: 'large';
  defenderWithPlacement: LargeUnitWithPlacement;
}

export type ResolveFlankEngagementEventUnion =
  | StandardResolveFlankEngagementEvent
  | SmallResolveFlankEngagementEvent
  | LargeResolveFlankEngagementEvent;

export type ResolveFlankEngagementEvent<
  TBoard extends Board = Board,
  _TEffectType extends typeof RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE =
    typeof RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE,
> = TBoard extends StandardBoard
  ? StandardResolveFlankEngagementEvent
  : TBoard extends SmallBoard
    ? SmallResolveFlankEngagementEvent
    : TBoard extends LargeBoard
      ? LargeResolveFlankEngagementEvent
      : ResolveFlankEngagementEventUnion;

const _standardResolveFlankEngagementEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal('standard' satisfies StandardBoard['boardType']),
  defenderWithPlacement: standardUnitWithPlacementSchema,
  newFacing: unitFacingSchema,
});

type StandardResolveFlankEngagementEventSchemaType = z.infer<
  typeof _standardResolveFlankEngagementEventSchemaObject
>;

const _assertExactStandardResolveFlankEngagementEvent: AssertExact<
  StandardResolveFlankEngagementEvent,
  StandardResolveFlankEngagementEventSchemaType
> = true;

const _smallResolveFlankEngagementEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal('small' satisfies SmallBoard['boardType']),
  defenderWithPlacement: smallUnitWithPlacementSchema,
  newFacing: unitFacingSchema,
});

type SmallResolveFlankEngagementEventSchemaType = z.infer<
  typeof _smallResolveFlankEngagementEventSchemaObject
>;

const _assertExactSmallResolveFlankEngagementEvent: AssertExact<
  SmallResolveFlankEngagementEvent,
  SmallResolveFlankEngagementEventSchemaType
> = true;

const _largeResolveFlankEngagementEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE),
  eventNumber: z.number(),
  boardType: z.literal('large' satisfies LargeBoard['boardType']),
  defenderWithPlacement: largeUnitWithPlacementSchema,
  newFacing: unitFacingSchema,
});

type LargeResolveFlankEngagementEventSchemaType = z.infer<
  typeof _largeResolveFlankEngagementEventSchemaObject
>;

const _assertExactLargeResolveFlankEngagementEvent: AssertExact<
  LargeResolveFlankEngagementEvent,
  LargeResolveFlankEngagementEventSchemaType
> = true;

const _resolveFlankEngagementEventSchemaObject = z.union([
  _standardResolveFlankEngagementEventSchemaObject,
  _smallResolveFlankEngagementEventSchemaObject,
  _largeResolveFlankEngagementEventSchemaObject,
]);

type ResolveFlankEngagementEventSchemaType = z.infer<
  typeof _resolveFlankEngagementEventSchemaObject
>;

const _assertExactResolveFlankEngagementEvent: AssertExact<
  ResolveFlankEngagementEvent<Board>,
  ResolveFlankEngagementEventSchemaType
> = true;

/** The schema for a resolve flank engagement event. */
export const resolveFlankEngagementEventSchema: z.ZodType<
  ResolveFlankEngagementEvent<Board>
> = _resolveFlankEngagementEventSchemaObject;
