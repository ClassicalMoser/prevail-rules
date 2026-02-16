import type { Board, EngagementType, UnitInstance } from '@entities';
import type { AssertExact } from '@utils';
import { engagementTypeSchema, unitInstanceSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the start engagement game effect. */
export const START_ENGAGEMENT_EFFECT_TYPE = 'startEngagement' as const;

/** The event to start an engagement. */
export interface StartEngagementEvent<
  _TBoard extends Board,
  _TEffectType extends 'startEngagement' = 'startEngagement',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof START_ENGAGEMENT_EFFECT_TYPE;
  /** The type of engagement. */
  engagementType: EngagementType;
  /** The defending unit at the target space. */
  defendingUnit: UnitInstance;
}

const _startEngagementEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(START_ENGAGEMENT_EFFECT_TYPE),
  /** The type of engagement. */
  engagementType: engagementTypeSchema,
  /** The defending unit at the target space. */
  defendingUnit: unitInstanceSchema,
});

type StartEngagementEventSchemaType = z.infer<
  typeof _startEngagementEventSchemaObject
>;

const _assertExactStartEngagementEvent: AssertExact<
  StartEngagementEvent<Board>,
  StartEngagementEventSchemaType
> = true;

/** The schema for a start engagement event. */
export const startEngagementEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'startEngagement'>;
  engagementType: typeof engagementTypeSchema;
  defendingUnit: typeof unitInstanceSchema;
}> = _startEngagementEventSchemaObject;
