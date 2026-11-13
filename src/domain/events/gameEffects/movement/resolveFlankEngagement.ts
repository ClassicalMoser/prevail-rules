import type { UnitFacing, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { unitFacingSchema, unitWithPlacementSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the resolve flank engagement game effect. */
export const RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE =
  'resolveFlankEngagement' as const;

/**
 * A defender engaged from the flank is turned to face its attacker, directly
 * opposite it (§6.3.4). It may not retreat; the two fight in Phase 4.
 *
 * `generateResolveFlankEngagementEvent` writes it, and `applyResolveFlankEngagementEvent` applies it.
 */
export interface ResolveFlankEngagementEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE;
  /** The defender, and where it stands before it turns. */
  defenderWithPlacement: UnitWithPlacement;
  /** The facing it turns to: directly opposite its attacker's (§6.3.4). */
  newFacing: UnitFacing;
}

const _resolveFlankEngagementEventSchemaObject = z
  .object({
    /** The defender, and where it stands before it turns. */
    defenderWithPlacement: unitWithPlacementSchema,
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE),
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** The facing it turns to: directly opposite its attacker's (§6.3.4). */
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
