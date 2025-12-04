import type { UnitPresence } from '@entities';
import type { AssertExact } from '@utils';
import { unitPresenceSchema } from '@entities';
import { z } from 'zod';

/** The event to resolve an engagement.
 * When a unit is moved into an enemy unit's space, the engagement is resolved.
 * If the defending unit is engaged from behind, it is routed.
 * If the defending unit is engaged from the flank, it must face the attacking unit.
 * If the defending unit is engaged from the front,
 * the attacking unit must turn to face the defending unit.
 */
export interface ResolveEngagementEvent {
  /** The type of the event. */
  eventType: 'gameEffect';
  /** The resulting unit presence after the engagement. */
  engagement: UnitPresence;
  /** Whether the defending unit is routed. */
  defendingUnitRouted: boolean;
}

const _resolveEngagementEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal('gameEffect' as const),
  /** The resulting unit presence after the engagement. */
  engagement: unitPresenceSchema,
  /** Whether the defending unit is routed. */
  defendingUnitRouted: z.boolean(),
});

type ResolveEngagementEventSchemaType = z.infer<
  typeof _resolveEngagementEventSchemaObject
>;

const _assertExactResolveEngagementEvent: AssertExact<
  ResolveEngagementEvent,
  ResolveEngagementEventSchemaType
> = true;

/** The schema for a resolve engagement event. */
export const resolveEngagementEventSchema: z.ZodType<ResolveEngagementEvent> =
  _resolveEngagementEventSchemaObject;
