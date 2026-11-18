import type { EngagementType, UnitWithPlacement } from '@entities';
import type { AssertExact } from '@utils';
import { engagementTypeSchema, unitWithPlacementSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The literal discriminant for the start engagement game effect. */
export const START_ENGAGEMENT_EFFECT_TYPE = 'startEngagement' as const;

/**
 * A move ends in an enemy's space, and an engagement begins (§6.1.1). Its
 * kind, front, flank or rear, is read from the two facings (§6.3.1), and
 * decides what happens next (§6.3.2–§6.3.4).
 *
 * `generateStartEngagementEvent` writes it, and `applyStartEngagementEvent` applies it.
 */
export interface StartEngagementEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof START_ENGAGEMENT_EFFECT_TYPE;
  /** Front, flank or rear, read from the two facings (§6.3.1). */
  engagementType: EngagementType;
  /** The defender, and where it stands. */
  defenderWithPlacement: UnitWithPlacement;
}

const _startEngagementEventSchemaObject = z
  .object({
    /** The defender, and where it stands. */
    defenderWithPlacement: unitWithPlacementSchema,
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(START_ENGAGEMENT_EFFECT_TYPE),
    /** Front, flank or rear, read from the two facings (§6.3.1). */
    engagementType: engagementTypeSchema,
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
  })
  .strict();

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
  eventType: z.ZodLiteral<typeof GAME_EFFECT_EVENT_TYPE>;
}> = _startEngagementEventSchemaObject;
