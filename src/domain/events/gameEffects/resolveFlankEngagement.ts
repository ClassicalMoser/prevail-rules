import type { Board, UnitFacing, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { unitFacingSchema, unitWithPlacementSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventType';
import { z } from 'zod';

export const RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE =
  'resolveFlankEngagement' as const;

/**
 * Completes flank engagement by rotating the defender to face the attacker.
 *
 * **Payload**: `defenderWithPlacement` is a procedure snapshot so apply does not call
 * `getPositionOfUnit`.
 */
export interface ResolveFlankEngagementEvent<
  TBoard extends Board,
  _TEffectType extends 'resolveFlankEngagement' = 'resolveFlankEngagement',
> {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE;
  /** Defender instance and placement before rotation. */
  defenderWithPlacement: UnitWithPlacement<TBoard>;
  /** The new facing of the defending unit. */
  newFacing: UnitFacing;
}

const _resolveFlankEngagementEventSchemaObject = z.object({
  /** The type of the event. */
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  /** The type of game effect. */
  effectType: z.literal(RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE),
  /** Defender instance and placement before rotation. */
  defenderWithPlacement: unitWithPlacementSchema,
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
  defenderWithPlacement: typeof unitWithPlacementSchema;
  newFacing: typeof unitFacingSchema;
}> = _resolveFlankEngagementEventSchemaObject;
