import type { EngagementType, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { engagementTypeSchema, unitWithPlacementSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the start engagement game effect. */
export const START_ENGAGEMENT_EFFECT_TYPE = 'startEngagement' as const;

export interface StartEngagementEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof START_ENGAGEMENT_EFFECT_TYPE;
  /** The ordered index of the event in the round, zero-indexed. */
  eventNumber: number;
  /** The type of engagement. */
  engagementType: EngagementType;
  /** The defender with placement. */
  defenderWithPlacement: UnitWithPlacement;
}

const _startEngagementEventSchemaObject = z.object({
  defenderWithPlacement: unitWithPlacementSchema,
  effectType: z.literal(START_ENGAGEMENT_EFFECT_TYPE),
  engagementType: engagementTypeSchema,
  eventNumber: z.number(),
  eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
});

type StartEngagementEventSchemaType = z.infer<
  typeof _startEngagementEventSchemaObject
>;

const _assertExactStartEngagementEvent: AssertExact<
  StartEngagementEvent,
  StartEngagementEventSchemaType
> = true;

/** The schema for a start engagement event. */
export const startEngagementEventSchema: z.ZodObject<{
  defenderWithPlacement: typeof unitWithPlacementSchema;
  effectType: z.ZodLiteral<typeof START_ENGAGEMENT_EFFECT_TYPE>;
  engagementType: typeof engagementTypeSchema;
  eventNumber: z.ZodNumber;
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
}> = _startEngagementEventSchemaObject;
