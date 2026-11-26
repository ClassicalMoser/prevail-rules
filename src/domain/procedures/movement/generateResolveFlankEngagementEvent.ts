import type { ResolveFlankEngagementEvent } from '@events';
import {
  GAME_EFFECT_EVENT_TYPE,
  RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE,
} from '@events';

/**
 * Generates a ResolveFlankEngagementEvent once a move has engaged its
 * defender from the flank (§6.3.4). The event carries nothing: where the
 * attacker's move ends is the movement's record, the defender is the one unit
 * in that space, and setting the attacker down turns the defender to face it.
 *
 * @returns A complete ResolveFlankEngagementEvent
 */
export function generateResolveFlankEngagementEvent(): ResolveFlankEngagementEvent {
  // The defender's new facing is directly opposite the engaging unit's
  // (§6.3.4), which the movement records, so nothing is recorded here.
  const event: ResolveFlankEngagementEvent = {
    effectType: RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // The defender is turned, for the transform to set the two down engaged.
  return event;
}
