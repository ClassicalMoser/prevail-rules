import type { GameOverEvent } from '@events';
import type { GameState } from '@game';
import { GAME_EFFECT_EVENT_TYPE, GAME_OVER_EFFECT_TYPE } from '@events';
import { findGameOverWinner } from '@queries';
import { throwIfUndefined } from '@utils';

/**
 * Generates a GameOverEvent by evaluating empty-hand and unpayable rout-discard
 * loss conditions. Bakes the winner into the event for replay.
 *
 * @param state - The current game state
 * @returns A complete GameOverEvent
 * @throws Error if endgame conditions are not met
 */
export function generateGameOverEvent(state: GameState): GameOverEvent {
  // TODO(misleading): the header names two loss conditions, but
  // `findGameOverWinner` also ends the game when an army has no units left
  // (§11.4). Settle by naming all three, or by pointing at the composed check.

  // The battle ends the instant a hand gives out, a rout cannot be paid for,
  // or an army is gone (§11.1, §11.2, §11.4). The expected engine asks for
  // this effect only once the same check has found a winner, so finding none
  // here means it was asked out of turn.
  const found = findGameOverWinner(state);
  const winner = throwIfUndefined(
    found,
    'Game over is not expected for the current game state',
  );

  // Every ending names a winner; there is no draw (§11.3). The winner goes on
  // the event, so a replay records the same result without asking again.
  const gameOver: GameOverEvent = {
    effectType: GAME_OVER_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
    winner,
  };

  // The effect that ends the game and records who prevailed.
  return gameOver;
}
