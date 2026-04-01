import type {
  Board,
  EngagementType,
  LargeBoard,
  LargeUnitWithPlacement,
  SmallBoard,
  SmallUnitWithPlacement,
  StandardBoard,
  StandardUnitWithPlacement,
} from '@entities';
import type { AssertExact } from '@utils';
import {
  engagementTypeSchema,
  largeUnitWithPlacementSchema,
  smallUnitWithPlacementSchema,
  standardUnitWithPlacementSchema,
} from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { type ZodDiscriminatedUnion, z } from 'zod';

/** The type of the start engagement game effect. */
export const START_ENGAGEMENT_EFFECT_TYPE = 'startEngagement' as const;

interface StartEngagementEventBase {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof START_ENGAGEMENT_EFFECT_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The type of engagement. */
  engagementType: EngagementType;
}

export interface StandardStartEngagementEvent extends StartEngagementEventBase {
  boardType: 'standard';
  defenderWithPlacement: StandardUnitWithPlacement;
}

export interface SmallStartEngagementEvent extends StartEngagementEventBase {
  boardType: 'small';
  defenderWithPlacement: SmallUnitWithPlacement;
}

export interface LargeStartEngagementEvent extends StartEngagementEventBase {
  boardType: 'large';
  defenderWithPlacement: LargeUnitWithPlacement;
}

export type StartEngagementEventUnion =
  | StandardStartEngagementEvent
  | SmallStartEngagementEvent
  | LargeStartEngagementEvent;

export type StartEngagementEvent<
  TBoard extends Board = Board,
  _TEffectType extends typeof START_ENGAGEMENT_EFFECT_TYPE =
    typeof START_ENGAGEMENT_EFFECT_TYPE,
> = TBoard extends StandardBoard
  ? StandardStartEngagementEvent
  : TBoard extends SmallBoard
    ? SmallStartEngagementEvent
    : TBoard extends LargeBoard
      ? LargeStartEngagementEvent
      : StartEngagementEventUnion;

const _standardStartEngagementEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof START_ENGAGEMENT_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  engagementType: typeof engagementTypeSchema;
  boardType: z.ZodLiteral<'standard'>;
  defenderWithPlacement: typeof standardUnitWithPlacementSchema;
}> = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(START_ENGAGEMENT_EFFECT_TYPE),
  eventNumber: z.number(),
  engagementType: engagementTypeSchema,
  boardType: z.literal('standard' satisfies StandardBoard['boardType']),
  defenderWithPlacement: standardUnitWithPlacementSchema,
});

type StandardStartEngagementEventSchemaType = z.infer<
  typeof _standardStartEngagementEventSchemaObject
>;

const _assertExactStandardStartEngagementEvent: AssertExact<
  StandardStartEngagementEvent,
  StandardStartEngagementEventSchemaType
> = true;

const _smallStartEngagementEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof START_ENGAGEMENT_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  engagementType: typeof engagementTypeSchema;
  boardType: z.ZodLiteral<'small'>;
  defenderWithPlacement: typeof smallUnitWithPlacementSchema;
}> = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(START_ENGAGEMENT_EFFECT_TYPE),
  eventNumber: z.number(),
  engagementType: engagementTypeSchema,
  boardType: z.literal('small' satisfies SmallBoard['boardType']),
  defenderWithPlacement: smallUnitWithPlacementSchema,
});

type SmallStartEngagementEventSchemaType = z.infer<
  typeof _smallStartEngagementEventSchemaObject
>;

const _assertExactSmallStartEngagementEvent: AssertExact<
  SmallStartEngagementEvent,
  SmallStartEngagementEventSchemaType
> = true;

const _largeStartEngagementEventSchemaObject: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof START_ENGAGEMENT_EFFECT_TYPE>;
  eventNumber: z.ZodNumber;
  engagementType: typeof engagementTypeSchema;
  boardType: z.ZodLiteral<'large'>;
  defenderWithPlacement: typeof largeUnitWithPlacementSchema;
}> = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  effectType: z.literal(START_ENGAGEMENT_EFFECT_TYPE),
  eventNumber: z.number(),
  engagementType: engagementTypeSchema,
  boardType: z.literal('large' satisfies LargeBoard['boardType']),
  defenderWithPlacement: largeUnitWithPlacementSchema,
});

type LargeStartEngagementEventSchemaType = z.infer<
  typeof _largeStartEngagementEventSchemaObject
>;

const _assertExactLargeStartEngagementEvent: AssertExact<
  LargeStartEngagementEvent,
  LargeStartEngagementEventSchemaType
> = true;

type _StartEngagementEventDiscriminatedUnion = ZodDiscriminatedUnion<
  readonly [
    typeof _standardStartEngagementEventSchemaObject,
    typeof _smallStartEngagementEventSchemaObject,
    typeof _largeStartEngagementEventSchemaObject,
  ],
  'boardType'
>;

const _startEngagementEventSchemaObject: _StartEngagementEventDiscriminatedUnion =
  z.discriminatedUnion('boardType', [
    _standardStartEngagementEventSchemaObject,
    _smallStartEngagementEventSchemaObject,
    _largeStartEngagementEventSchemaObject,
  ]);

type StartEngagementEventSchemaType = z.infer<
  typeof _startEngagementEventSchemaObject
>;

const _assertExactStartEngagementEvent: AssertExact<
  StartEngagementEvent<Board>,
  StartEngagementEventSchemaType
> = true;

/** The schema for a start engagement event. */
export const startEngagementEventSchema: typeof _startEngagementEventSchemaObject =
  _startEngagementEventSchemaObject;
