import type { CompletePlayCardsPhaseEvent } from '@events';
import type { GameState } from '@game';
import {
  COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';

/**
 * Generates a CompletePlayCardsPhaseEvent to complete the play cards phase
 * and advance to move commanders phase.
 *
 * @param state - The current game state
 * @returns A complete CompletePlayCardsPhaseEvent
 */
export function generateCompletePlayCardsPhaseEvent(
  state: GameState,
): CompletePlayCardsPhaseEvent {
  // Return is independent of state, so we can ignore it
  // TODO(composition): this takes the state only to ignore it, so asked
  // outside Play Cards it still answers, where `DESIGN.md` has a function
  // asked outside its gate throw. `generateCompleteMoveCommandersPhaseEvent`
  // reads its phase to insist on it; `generateCompleteUnitMovementEvent`
  // takes no state at all. Settle by reading the phase through
  // `getPlayCardsPhaseState` and refusing any step but `complete`, or by
  // dropping the parameter.
  const _stateUnused = state;

  // Both cards are face up and initiative is settled (§4.1.3, §4.1.4): who
  // holds it, and each player's card in play, are on the state, so nothing
  // is recorded. The commanders move next, the first player's first
  // (§4.2.1).
  const event: CompletePlayCardsPhaseEvent = {
    effectType: COMPLETE_PLAY_CARDS_PHASE_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
  };

  // Phase 1 ends, for the transform to open Move Commanders.
  return event;
}
