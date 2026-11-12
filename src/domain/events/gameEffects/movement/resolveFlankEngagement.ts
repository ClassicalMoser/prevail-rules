import type { UnitFacing, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { unitFacingSchema, unitWithPlacementSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

export const RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE =
  'resolveFlankEngagement' as const;

/**
 * A defender engaged from the flank is turned to face its attacker, directly
 * opposite it (§6.3.4). It may not retreat; the two fight in Phase 4.
 */
export interface ResolveFlankEngagementEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE;
  /** The defender with placement. */
  defenderWithPlacement: UnitWithPlacement;
  /** The new facing of the defending unit. */
  newFacing: UnitFacing;
}

const _resolveFlankEngagementEventSchemaObject = z
  .object({
    defenderWithPlacement: unitWithPlacementSchema,
    effectType: z.literal(RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE),
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    newFacing: unitFacingSchema,
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
  defenderWithPlacement: typeof unitWithPlacementSchema;
  effectType: z.ZodLiteral<typeof RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE>;
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  newFacing: typeof unitFacingSchema;
}> = _resolveFlankEngagementEventSchemaObject;
