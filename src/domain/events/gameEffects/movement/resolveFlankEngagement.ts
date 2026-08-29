import type { UnitFacing, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { unitFacingSchema, unitWithPlacementSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

export const RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE =
  'resolveFlankEngagement' as const;

export interface ResolveFlankEngagementEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE;
  /** The defender with placement. */
  defenderWithPlacement: UnitWithPlacement;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The new facing of the defending unit. */
  newFacing: UnitFacing;
}

const _resolveFlankEngagementEventSchemaObject = z
  .object({
    defenderWithPlacement: unitWithPlacementSchema,
    effectType: z.literal(RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE),
    eventNumber: z.number(),
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
  eventNumber: z.ZodNumber;
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
  newFacing: typeof unitFacingSchema;
}> = _resolveFlankEngagementEventSchemaObject;
