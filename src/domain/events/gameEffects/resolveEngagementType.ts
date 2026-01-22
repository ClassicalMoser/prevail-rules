import type { Board, EngagementType } from '@entities';
import type { AssertExact } from '@utils';
import { engagementTypeSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

/** The type of the resolve engagement game effect. */
export const RESOLVE_ENGAGEMENT_EFFECT_TYPE = 'resolveEngagementType' as const;

/** The event to resolve an engagement type.
 * When a unit is moved into an enemy unit's space, the engagement type is resolved.
 * The engagement type is the type of engagement that the defending unit is engaged in.
 */
export interface ResolveEngagementTypeEvent<
  _TBoard extends Board,
  _TEffectType extends 'resolveEngagementType' = 'resolveEngagementType',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_ENGAGEMENT_EFFECT_TYPE;
  /** The engagement type. */
  engagementType: EngagementType;
}

const _resolveEngagementTypeEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_ENGAGEMENT_EFFECT_TYPE),
  /** The engagement type. */
  engagementType: engagementTypeSchema,
});

type ResolveEngagementTypeEventSchemaType = z.infer<
  typeof _resolveEngagementTypeEventSchemaObject
>;

const _assertExactResolveEngagementTypeEvent: AssertExact<
  ResolveEngagementTypeEvent<Board>,
  ResolveEngagementTypeEventSchemaType
> = true;

/** The schema for a resolve engagement type event. */
export const resolveEngagementTypeEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'resolveEngagementType'>;
  engagementType: typeof engagementTypeSchema;
}> = _resolveEngagementTypeEventSchemaObject;
