import type { RoundEndEvent } from '@events';
import type { GameState } from '@game';
import { ROUND_END_EFFECT_TYPE, GAME_EFFECT_EVENT_TYPE } from '@events';

/**
 * Generates a RoundEndEvent to complete the cleanup phase,
 * advance round, and reset to play cards phase.
 *
 * @param state - The current game state
 * @returns A complete RoundEndEvent
 */
export function generateRoundEndEvent(state: GameState): RoundEndEvent {
  // Return is independent of state, so we can ignore it
  // TODO(composition): this takes the state only to ignore it, so asked
  // mid-round it still answers, where `DESIGN.md` has a function asked
  // outside its gate throw. The expected engine asks for it at two gates:
  // the end of setup and Cleanup's `complete` step. Settle by refusing
  // anywhere else, or by dropping the parameter as
  // `generateCompleteUnitMovementEvent` does.
  const _stateUnused = state;

  // Both players have rallied or declined, and the round is over (§4.5.4);
  // or setup is, and round 1 begins (DESIGN.md, Rounds). The next round
  // starts at Phase 1 with nothing carried over but what is on the table
  // (§1.5), so nothing is recorded.
  // TODO(misleading): the header says this completes the cleanup phase, but
  // the expected engine also asks for it to end setup, round 0, where there
  // is no cleanup (`getExpectedSetupEvent`). Settle by naming both in the
  // header.
  const event: RoundEndEvent = {
    effectType: ROUND_END_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // The round ends, for the transform to begin the next at Phase 1.
  return event;
}
