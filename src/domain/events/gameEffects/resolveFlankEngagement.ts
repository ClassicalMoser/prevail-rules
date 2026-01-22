import type { Board, UnitFacing, UnitInstance } from '@entities';
import type { AssertExact } from '@utils';
import { unitFacingSchema, unitInstanceSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

export const RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE =
  'resolveFlankEngagement' as const;

export interface ResolveFlankEngagementEvent<
  _TBoard extends Board,
  _TEffectType extends 'resolveFlankEngagement' = 'resolveFlankEngagement',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE;
  /** The unit instance that is being rotated. */
  defendingUnit: UnitInstance;
  /** The new facing of the defending unit. */
  newFacing: UnitFacing;
}

const _resolveFlankEngagementEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE),
  /** The unit instance that is being rotated. */
  defendingUnit: unitInstanceSchema,
  /** The new facing of the defending unit. */
  newFacing: unitFacingSchema,
});

type ResolveFlankEngagementEventSchemaType = z.infer<
  typeof _resolveFlankEngagementEventSchemaObject
>;

const _assertExactResolveFlankEngagementEvent: AssertExact<
  ResolveFlankEngagementEvent<Board>,
  ResolveFlankEngagementEventSchemaType
> = true;

/** The schema for a resolve flank engagement event. */
export const resolveFlankEngagementEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'resolveFlankEngagement'>;
  defendingUnit: typeof unitInstanceSchema;
  newFacing: typeof unitFacingSchema;
}> = _resolveFlankEngagementEventSchemaObject;
