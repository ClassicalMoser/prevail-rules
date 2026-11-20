import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the resolve flank engagement game effect. */
export const RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE =
  'resolveFlankEngagement' as const;

// TODO(misleading): "sets the attacker down beside the defender" — the two share the defender's space as an engaged pair, as applyResolveFlankEngagementEvent says ("set down in the defender's space"). Settled by rewording to "in the defender's space".
/**
 * A defender engaged from the flank is turned to face its attacker, directly
 * opposite it (§6.3.4). It may not retreat; the two fight in Phase 4.
 *
 * Where the attacker's move ends is the movement's record, and the defender
 * is the one unit in that space, so this carries nothing: applying it sets
 * the attacker down beside the defender, and the pair faces each other.
 *
 * `generateResolveFlankEngagementEvent` writes it, and `applyResolveFlankEngagementEvent` applies it.
 */
export interface ResolveFlankEngagementEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE;
}

const _resolveFlankEngagementEventSchemaObject = z
  .object({
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE),
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  })
  .strict();

type ResolveFlankEngagementEventSchemaType = z.infer<
  typeof _resolveFlankEngagementEventSchemaObject
>;

const _assertExactResolveFlankEngagementEvent: AssertExact<
  ResolveFlankEngagementEvent,
  ResolveFlankEngagementEventSchemaType
> = true;

/** The schema for a resolve flank engagement event. */
export const resolveFlankEngagementEventSchema: z.ZodObject<{
  effectType: z.ZodLiteral<typeof RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE>;
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
}> = _resolveFlankEngagementEventSchemaObject;
