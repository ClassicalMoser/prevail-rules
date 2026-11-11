import type { GameOverEvent } from '@events';
import type { GameState } from '@game';
import { GAME_EFFECT_EVENT_TYPE, GAME_OVER_EFFECT_TYPE } from '@events';
import { findGameOverWinner } from '@queries';

/**
 * Generates a GameOverEvent by evaluating empty-hand and unpayable rout-discard
 * loss conditions. Bakes the winner into the event for replay.
 *
 * @param state - The current game state
 * @returns A complete GameOverEvent
 * @throws Error if endgame conditions are not met
 */
export function generateGameOverEvent(state: GameState): GameOverEvent {
  const winner = findGameOverWinner(state);
  if (winner === undefined) {
    throw new Error('Game over is not expected for the current game state');
  }

  return {
    effectType: GAME_OVER_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
    winner,
  };
}
