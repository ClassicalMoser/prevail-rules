import type { Board } from '@entities';
import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

export const RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE =
  'resolveEngageRetreatOption' as const;

export interface ResolveEngageRetreatOptionEvent<
  _TBoard extends Board,
  _TEffectType extends 'resolveEngageRetreatOption' =
    'resolveEngageRetreatOption',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE;
  /** Whether the defending unit can retreat. */
  defendingUnitCanRetreat: boolean;
}

const _resolveEngageRetreatOptionEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE),
  /** Whether the defending unit can retreat. */
  defendingUnitCanRetreat: z.boolean(),
});

type ResolveEngageRetreatOptionEventSchemaType = z.infer<
  typeof _resolveEngageRetreatOptionEventSchemaObject
>;

const _assertExactResolveEngageRetreatOptionEvent: AssertExact<
  ResolveEngageRetreatOptionEvent<Board>,
  ResolveEngageRetreatOptionEventSchemaType
> = true;

/** The schema for a resolve engage retreat option event. */
export const resolveEngageRetreatOptionEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'resolveEngageRetreatOption'>;
  defendingUnitCanRetreat: z.ZodBoolean;
}> = _resolveEngageRetreatOptionEventSchemaObject;
