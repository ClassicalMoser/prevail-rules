import type { PlayerSide } from '@entities';
import type { GameState } from '@game';

import { getWinnerFromEmptyHands } from './getWinnerFromEmptyHands';
import { getWinnerFromUnpayableRoutDiscard } from './getWinnerFromUnpayableRoutDiscard';

/**
 * Composed endgame check for router + `gameOver` procedure.
 * Empty-hand first, then unpayable forced rout discard. Every ending names
 * a winner — there is no draw in this game (§11.3).
 *
 * @param state - The current game state.
 * @returns Winning side, or `undefined` if the game continues.
 */
export function getGameOverWinner(state: GameState): PlayerSide | undefined {
  const emptyHandWinner = getWinnerFromEmptyHands(state);
  if (emptyHandWinner !== undefined) {
    return emptyHandWinner;
  }
  const routDiscardWinner = getWinnerFromUnpayableRoutDiscard(state);
  return routDiscardWinner;
}
