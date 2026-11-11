import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the trigger rout from retreat game effect. */
export const TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE =
  'triggerRoutFromRetreat' as const;

/**
 * When a retreat has **no** legal positions, the rules replace retreat with rout (§9.1.6). This
 * effect seeds `routState` on the retreat substep that is already open. It carries nothing: the
 * retreat waiting for its rout is the state's to name, as the rout awaiting its penalty is.
 */
export interface TriggerRoutFromRetreatEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE;
}

const _triggerRoutFromRetreatEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** The type of game effect. */
    effectType: z.literal(TRIGGER_ROUT_FROM_RETREAT_EFFECT_TYPE),
  })
  .strict();

type TriggerRoutFromRetreatEventSchemaType = z.infer<
  typeof _triggerRoutFromRetreatEventSchemaObject
>;

const _assertExactTriggerRoutFromRetreatEvent: AssertExact<
  TriggerRoutFromRetreatEvent,
  TriggerRoutFromRetreatEventSchemaType
> = true;

/** The schema for a trigger rout from retreat event. */
export const triggerRoutFromRetreatEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'triggerRoutFromRetreat'>;
}> = _triggerRoutFromRetreatEventSchemaObject;
