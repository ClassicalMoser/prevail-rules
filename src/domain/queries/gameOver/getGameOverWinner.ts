import type { PlayerSide } from '@entities';
import type { GameState } from '@game';

import { getWinnerFromEmptyHands } from './getWinnerFromEmptyHands';
import { getWinnerFromUnpayableRoutDiscard } from './getWinnerFromUnpayableRoutDiscard';

/**
 * Composed endgame check for router + `gameOver` procedure.
 * Empty-hand first, then unpayable forced rout discard.
 *
 * @param state - The current game state.
 * @returns Winning side, `null` for draw, or `undefined` if the game continues.
 */
export function getGameOverWinner(
  state: GameState,
): PlayerSide | null | undefined {
  const emptyHandWinner = getWinnerFromEmptyHands(state);
  if (emptyHandWinner !== undefined) {
    return emptyHandWinner;
  }
  const routDiscardWinner = getWinnerFromUnpayableRoutDiscard(state);
  return routDiscardWinner;
}
