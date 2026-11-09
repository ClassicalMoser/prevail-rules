import type { PlayerSide } from '@entities';
import type { GameState } from '@game';

import { getWinnerFromEmptyHands } from './getWinnerFromEmptyHands';
import { getWinnerFromNoUnits } from './getWinnerFromNoUnits';
import { getWinnerFromUnpayableRoutDiscard } from './getWinnerFromUnpayableRoutDiscard';

/**
 * Composed endgame check for router + `gameOver` procedure.
 * Empty-hand first, then unpayable forced rout discard, then a destroyed
 * army, in the rulebook's own order (§11.1–§11.4). Every ending names a
 * winner — there is no draw in this game (§11.3).
 *
 * @param state - The current game state.
 * @returns Winning side, or `undefined` if the game continues.
 */
export function getGameOverWinner(state: GameState): PlayerSide | undefined {
  // The hand is the game's clock: an army with nothing in hand has nothing
  // left to fight with, so it is asked about first (§11.1).
  const emptyHandWinner = getWinnerFromEmptyHands(state);
  if (emptyHandWinner !== undefined) {
    return emptyHandWinner;
  }
  // A Morale cost the hand cannot survive is the same loss, seen one event
  // early (§11.2).
  const routDiscardWinner = getWinnerFromUnpayableRoutDiscard(state);
  if (routDiscardWinner !== undefined) {
    return routDiscardWinner;
  }
  // Last, the rare case: an army destroyed to the last unit loses, however
  // many cards its player still holds (§11.4).
  const noUnitsWinner = getWinnerFromNoUnits(state);
  return noUnitsWinner;
}
