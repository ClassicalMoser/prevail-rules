import type { PlayerSide } from '@entities';
import type { GameState } from '@game';
import { isPending } from '@utils';
import { findRoutState } from '../sequencing/combatOutcomes/rout/findRoutState';
import { isAwaitingRoutDiscard } from '../sequencing/combatOutcomes/rout/isAwaitingRoutDiscard';

/**
 * Forced rout-discard loss: a player who must discard at least as many cards as
 * they hold cannot pay, and the other player wins immediately.
 *
 * Optional commit discards are not checked here.
 *
 * @param state - The current game state.
 * @returns Winning side, or `undefined` when no unpayable rout discard is pending.
 */
export function getWinnerFromUnpayableRoutDiscard(
  state: GameState,
): PlayerSide | undefined {
  // This is asked on every state, and most of a game has no rout open, so a
  // missing rout is an answer rather than something to recover from.
  const routState = findRoutState(state);
  if (routState === undefined || !isAwaitingRoutDiscard(routState)) {
    return undefined;
  }

  // The check above already settled this; the guard is what narrows the count.
  const penalty = routState.numberToDiscard;
  if (isPending(penalty)) {
    return undefined;
  }

  const handSize = state.cardState[routState.player].inHand.length;
  if (penalty < handSize) {
    return undefined;
  }

  const winner = routState.player === 'white' ? 'black' : 'white';
  return winner;
}
