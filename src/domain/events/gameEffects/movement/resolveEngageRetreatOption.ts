import type { MoveDelta } from '@entities';
import type { AssertExact } from '@utils';
import { moveDeltaSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

export const RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE =
  'resolveEngageRetreatOption' as const;

export interface ResolveEngageRetreatOptionEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE;
  /**
   * The retreats the defender may make, each as its path (§9.1.3). Empty when
   * the defender has nowhere to fall back to or is not the faster, so it
   * stands (§6.3.2).
   */
  retreatPaths: MoveDelta[][];
}

const _resolveEngageRetreatOptionEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** The type of game effect. */
    effectType: z.literal(RESOLVE_ENGAGE_RETREAT_OPTION_EFFECT_TYPE),
    /** The retreats the defender may make, each as its path. */
    retreatPaths: z.array(z.array(moveDeltaSchema)),
  })
  .strict();

type ResolveEngageRetreatOptionEventSchemaType = z.infer<
  typeof _resolveEngageRetreatOptionEventSchemaObject
>;

const _assertExactResolveEngageRetreatOptionEvent: AssertExact<
  ResolveEngageRetreatOptionEvent,
  ResolveEngageRetreatOptionEventSchemaType
> = true;

/** The schema for a resolve engage retreat option event. */
export const resolveEngageRetreatOptionEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'resolveEngageRetreatOption'>;
  retreatPaths: z.ZodArray<z.ZodArray<typeof moveDeltaSchema>>;
}> = _resolveEngageRetreatOptionEventSchemaObject;
