import type { RoundEndEvent } from '@events';
import { ROUND_END_EFFECT_TYPE, GAME_EFFECT_EVENT_TYPE } from '@events';

/**
 * Generates a RoundEndEvent, ending a round and beginning the next at Play
 * Cards. It ends setup, round 0, the same way it ends a round after Cleanup.
 * Nothing carries over but what is on the table, so the event carries
 * nothing.
 *
 * @returns A complete RoundEndEvent
 */
export function generateRoundEndEvent(): RoundEndEvent {
  // Both players have rallied or declined, and the round is over (§4.5.4);
  // or setup is, and round 1 begins (DESIGN.md, Rounds). The next round
  // starts at Phase 1 with nothing carried over but what is on the table
  // (§1.5), so nothing is recorded.
  const event: RoundEndEvent = {
    effectType: ROUND_END_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // The round ends, for the transform to begin the next at Phase 1.
  return event;
}
