import type { Board } from '@entities';
import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

export const COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE =
  'completeMeleeResolution' as const;

export interface CompleteMeleeResolutionEvent<
  _TBoard extends Board,
  _TEffectType extends 'completeMeleeResolution' = 'completeMeleeResolution',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE;
}

const _completeMeleeResolutionEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(COMPLETE_MELEE_RESOLUTION_EFFECT_TYPE),
});

type CompleteMeleeResolutionEventSchemaType = z.infer<
  typeof _completeMeleeResolutionEventSchemaObject
>;

const _assertExactCompleteMeleeResolutionEvent: AssertExact<
  CompleteMeleeResolutionEvent<Board>,
  CompleteMeleeResolutionEventSchemaType
> = true;

/** The schema for a complete melee resolution event. */
export const completeMeleeResolutionEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'completeMeleeResolution'>;
}> = _completeMeleeResolutionEventSchemaObject;
