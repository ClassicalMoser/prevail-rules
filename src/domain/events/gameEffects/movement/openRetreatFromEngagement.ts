import type { MoveDelta } from '@entities';
import type { AssertExact } from '@utils';
import { moveDeltaSchema } from '@entities';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the open-retreat-from-engagement game effect. */
export const OPEN_RETREAT_FROM_ENGAGEMENT_EFFECT_TYPE =
  'openRetreatFromEngagement' as const;

/**
 * Opens the retreat of a defender engaged from the front that has chosen to
 * fall back (§6.3.2). The retreats it may make are worked out when the event
 * is built, and recorded on it, so the log shows what was legal; applying it
 * only writes them into the engagement.
 */
export interface OpenRetreatFromEngagementEvent {
  /** The type of the event. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** The type of game effect. */
  effectType: typeof OPEN_RETREAT_FROM_ENGAGEMENT_EFFECT_TYPE;
  /**
   * The retreats the defender may make, each as its path (§9.1.3). Never empty:
   * a defender with nowhere to fall back to stands, and no retreat opens
   * (§9.1.5).
   */
  retreatPaths: MoveDelta[][];
}

const _openRetreatFromEngagementEventSchemaObject = z
  .object({
    /** The type of the event. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** The type of game effect. */
    effectType: z.literal(OPEN_RETREAT_FROM_ENGAGEMENT_EFFECT_TYPE),
    /** The retreats the defender may make, each as its path. */
    retreatPaths: z.array(z.array(moveDeltaSchema)),
  })
  .strict();

type OpenRetreatFromEngagementEventSchemaType = z.infer<
  typeof _openRetreatFromEngagementEventSchemaObject
>;

const _assertExactOpenRetreatFromEngagementEvent: AssertExact<
  OpenRetreatFromEngagementEvent,
  OpenRetreatFromEngagementEventSchemaType
> = true;

/** The schema for an open-retreat-from-engagement event. */
export const openRetreatFromEngagementEventSchema: z.ZodObject<{
  eventType: z.ZodLiteral<'gameEffect'>;
  effectType: z.ZodLiteral<'openRetreatFromEngagement'>;
  retreatPaths: z.ZodArray<z.ZodArray<typeof moveDeltaSchema>>;
}> = _openRetreatFromEngagementEventSchemaObject;
