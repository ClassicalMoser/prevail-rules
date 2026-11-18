import type { CompleteMoveCommandersPhaseEvent } from '@events';
import type { GameState } from '@game';
import {
  COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
  GAME_EFFECT_EVENT_TYPE,
} from '@events';
import { getCardInPlay, getOtherPlayer } from '@queries';

import { toRemainingCommands } from './toRemainingCommands';

/**
 * Generates a CompleteMoveCommandersPhaseEvent to complete the move commanders phase
 * and advance to issue commands phase.
 *
 * Remaining command sets are derived from each side's in-play card so replay does
 * not re-read cards. Lines ×N expand into N `number: 1` slots; units ×N stay one grant.
 *
 * @param state - The current game state
 * @returns A complete CompleteMoveCommandersPhaseEvent
 */
export function generateCompleteMoveCommandersPhaseEvent(
  state: GameState,
): CompleteMoveCommandersPhaseEvent {
  const firstPlayer = state.currentInitiative;
  const secondPlayer = getOtherPlayer(firstPlayer);

  // Each player's revealed card grants the round's orders (§4.1.6).
  const remainingCommandsFirstPlayer = toRemainingCommands(
    getCardInPlay(state.cardState, firstPlayer).command,
  );
  const remainingCommandsSecondPlayer = toRemainingCommands(
    getCardInPlay(state.cardState, secondPlayer).command,
  );

  return {
    effectType: COMPLETE_MOVE_COMMANDERS_PHASE_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
    remainingCommandsFirstPlayer,
    remainingCommandsSecondPlayer,
  };
}
