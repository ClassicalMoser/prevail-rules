import type { UnitPresence } from '@entities';
import type { AssertExact } from '@utils';
import { unitPresenceSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';
import { RESOLVE_ENGAGEMENT_EFFECT_TYPE } from './gameEffect';


/** The event to resolve an engagement.
 * When a unit is moved into an enemy unit's space, the engagement is resolved.
 * If the defending unit is engaged from behind, it is routed.
 * If the defending unit is engaged from the flank, it must face the attacking unit.
 * If the defending unit is engaged from the front,
 * the attacking unit must turn to face the defending unit.
 *
 * Additionally, if the defending unit has a speed greater than that of the attacking unit,
 * the defending unit can retreat.
 */
export interface ResolveEngagementEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_ENGAGEMENT_EFFECT_TYPE;
  /** The resulting unit presence after the engagement. */
  engagement: UnitPresence;
  /** Whether the defending unit is routed. */
  defendingUnitRouted: boolean;
  /** Whether the defending unit can retreat. */
  defendingUnitCanRetreat: boolean;
}

const _resolveEngagementEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_ENGAGEMENT_EFFECT_TYPE),
  /** The resulting unit presence after the engagement. */
  engagement: unitPresenceSchema,
  /** Whether the defending unit is routed. */
  defendingUnitRouted: z.boolean(),
  /** Whether the defending unit can retreat. */
  defendingUnitCanRetreat: z.boolean(),
});

type ResolveEngagementEventSchemaType = z.infer<
  typeof _resolveEngagementEventSchemaObject
>;

const _assertExactResolveEngagementEvent: AssertExact<
  ResolveEngagementEvent,
  ResolveEngagementEventSchemaType
> = true;

/** The schema for a resolve engagement event. */
export const resolveEngagementEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  effectType: z.ZodLiteral<typeof RESOLVE_ENGAGEMENT_EFFECT_TYPE>;
  engagement: typeof unitPresenceSchema;
  defendingUnitRouted: z.ZodBoolean;
  defendingUnitCanRetreat: z.ZodBoolean;
}> = _resolveEngagementEventSchemaObject;
