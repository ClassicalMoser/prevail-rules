import type { ResolveFlankEngagementEvent } from '@events';
import type { GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE,
} from '@events';
import { getFlankEngagementStateFromMovement } from '@queries';

/**
 * Generates a ResolveFlankEngagementEvent once a move has engaged its
 * defender from the flank (§6.3.4). The event carries nothing: where the
 * attacker's move ends is the movement's record, the defender is the one unit
 * in that space, and setting the attacker down turns the defender to face it.
 *
 * The expected engine asks for it only during a flank engagement, so being
 * asked anywhere else is the caller's mistake and throws.
 *
 * @param state - The current game state
 * @returns A complete ResolveFlankEngagementEvent
 * @throws Error when no flank engagement is under way
 */
export function generateResolveFlankEngagementEvent(
  state: GameState,
): ResolveFlankEngagementEvent {
  // Only a flank engagement turns its defender.
  getFlankEngagementStateFromMovement(state);

  const event: ResolveFlankEngagementEvent = {
    effectType: RESOLVE_FLANK_ENGAGEMENT_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };
  return event;
}
