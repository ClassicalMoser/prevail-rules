import type { OpenRetreatFromEngagementEvent } from '@events';
import {
  GAME_EFFECT_EVENT_TYPE,
  OPEN_RETREAT_FROM_ENGAGEMENT_EFFECT_TYPE,
} from '@events';

/**
 * Builds the effect that opens a front-engaged defender's retreat, once it
 * has chosen to fall back (§6.3.2). The retreats it may make were worked out
 * and recorded when the engagement resolved the retreat option, so this only
 * says that the retreat opens.
 *
 * @returns The event
 */
export function generateOpenRetreatFromEngagementEvent(): OpenRetreatFromEngagementEvent {
  const event: OpenRetreatFromEngagementEvent = {
    effectType: OPEN_RETREAT_FROM_ENGAGEMENT_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };
  return event;
}
