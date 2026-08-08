import type { PlayerSide } from '@entities';
import type { GameState } from '@game';

import { getAwaitingRoutDiscardState } from '../sequencing/getSubstep/getAwaitingRoutDiscardState';

/**
 * Forced rout-discard loss: when a player must discard at least as many cards
 * as they hold, the other player wins immediately.
 *
 * Optional commit discards are not checked here.
 *
 * @returns Winning side, or `undefined` when no unpayable rout discard is pending.
 */
export function getWinnerFromUnpayableRoutDiscard(
  state: GameState,
): PlayerSide | undefined {
  const routState = getAwaitingRoutDiscardState(state);
  if (routState === null || routState.numberToDiscard === 'pending') {
    return undefined;
  }

  const handSize = state.cardState[routState.player].inHand.length;
  if (routState.numberToDiscard < handSize) {
    return undefined;
  }

  return routState.player === 'white' ? 'black' : 'white';
}
