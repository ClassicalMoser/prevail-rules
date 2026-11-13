import type { AssertExact } from '@utils';
import { GAME_EFFECT_EVENT_TYPE } from '@events/eventTypeLiterals';
import { z } from 'zod';

/** The type of the open-retreat-from-engagement game effect. */
export const OPEN_RETREAT_FROM_ENGAGEMENT_EFFECT_TYPE =
  'openRetreatFromEngagement' as const;

/**
 * Opens the retreat of a defender engaged from the front that has chosen to
 * fall back (§6.3.2). The retreats it may make were recorded when the
 * engagement worked out whether the defender could retreat, so this carries
 * nothing: applying it opens the retreat with the paths the engagement holds.
 *
 * `generateOpenRetreatFromEngagementEvent` writes it, and `applyOpenRetreatFromEngagementEvent` applies it.
 */
export interface OpenRetreatFromEngagementEvent {
  /** A game effect, not a player choice. */
  eventType: typeof GAME_EFFECT_EVENT_TYPE;
  /** Which effect this is. Game effects are told apart by it. */
  effectType: typeof OPEN_RETREAT_FROM_ENGAGEMENT_EFFECT_TYPE;
}

const _openRetreatFromEngagementEventSchemaObject = z
  .object({
    /** A game effect, not a player choice. */
    eventType: z.literal(GAME_EFFECT_EVENT_TYPE),
    /** Which effect this is. Game effects are told apart by it. */
    effectType: z.literal(OPEN_RETREAT_FROM_ENGAGEMENT_EFFECT_TYPE),
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
}> = _openRetreatFromEngagementEventSchemaObject;
