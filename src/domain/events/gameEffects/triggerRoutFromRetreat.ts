import type { Board } from '@entities';
import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the trigger rout from retreat game effect. */
export const TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE =
  'triggerRoutFromRetreat' as const;

/** An event to trigger a rout from a retreat. */
export interface TriggerRoutFromRetreatEvent<
  _TBoard extends Board,
  _TEffectType extends 'triggerRoutFromRetreat' = 'triggerRoutFromRetreat',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE;
}

const _triggerRoutFromRetreatEventSchemaObject = z.object({
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE),
});

type TriggerRoutFromRetreatEventSchemaType = z.infer<
  typeof _triggerRoutFromRetreatEventSchemaObject
>;

const _assertExactTriggerRoutFromRetreatEvent: AssertExact<
  TriggerRoutFromRetreatEvent<Board>,
  TriggerRoutFromRetreatEventSchemaType
> = true;

/** The schema for a trigger rout from retreat event. */
export const triggerRoutFromRetreatEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'triggerRoutFromRetreat'>;
}> = _triggerRoutFromRetreatEventSchemaObject;
