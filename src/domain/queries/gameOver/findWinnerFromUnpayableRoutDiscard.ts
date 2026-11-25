import type { PlayerSide } from '@entities';
import type { GameState } from '@game';
import { throwIfPending } from '@utils';
import { getOtherPlayer } from '@queries/player';
import { findRoutOwingDiscard } from '../sequencing/combatOutcomes/rout/findRoutOwingDiscard';

/**
 * Forced rout-discard loss: a player who must discard at least as many cards as
 * they hold cannot pay, and the other player wins immediately.
 *
 * Optional commit discards are not checked here.
 *
 * @param state - The current game state.
 * @returns Winning side, or `undefined` when no unpayable rout discard is pending.
 */
export function findWinnerFromUnpayableRoutDiscard(
  state: GameState,
): PlayerSide | undefined {
  // This is asked on every state, and most of a game has no rout open, so a
  // missing rout is an answer rather than something to recover from.
  const routState = findRoutOwingDiscard(state);
  if (routState === undefined) {
    return undefined;
  }

  // `findRoutOwingDiscard` answers only a rout whose penalty is counted, so
  // the count is known; this insists on it rather than guarding twice.
  const penalty = throwIfPending(
    routState.numberToDiscard,
    'A rout owing its discard has its penalty counted',
  );

  // Paying with the last card is already a loss, so the hand must hold more
  // cards than the penalty (§11.2). A smaller penalty is paid and play goes on.
  const handSize = state.cardState[routState.player].inHand.length;
  if (penalty < handSize) {
    return undefined;
  }

  // The player who cannot pay loses, so the other wins.
  const winner = getOtherPlayer(routState.player);
  return winner;
}
