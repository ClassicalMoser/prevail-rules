import type { PlayerSide } from '@entities';
import type { GameState } from '@game';

/**
 * Empty-hand loss rule: either hand empty means the other player wins.
 * Both empty at once goes to the player who held initiative going into the
 * round (§11.3) — there is no draw in this game. Neither empty → game
 * continues (`undefined`).
 *
 * @param state - The current game state.
 * @returns Winning side, or `undefined` if the game continues.
 */
export function findWinnerFromEmptyHands(
  state: GameState,
): PlayerSide | undefined {
  // Only the hand counts: cards in play, played or discarded are not the
  // army's will to fight (§11.1).
  const whiteEmpty = state.cardState.white.inHand.length === 0;
  const blackEmpty = state.cardState.black.inHand.length === 0;

  if (whiteEmpty && blackEmpty) {
    // Both armies' will to fight gave out in the same instant, which only
    // happens when both played their last card face-down in Phase 1. Those
    // commitments were made before either card was revealed, so the tie goes
    // to the initiative held going into the round (§11.3) — still unrewritten
    // here, because the new initiative is only assigned after the reveal.
    const tieWinner = state.currentInitiative;
    return tieWinner;
  }

  // White's hand is empty: White has lost, and Black prevails.
  if (whiteEmpty) {
    return 'black';
  }

  // Black's hand is empty: Black has lost, and White prevails.
  if (blackEmpty) {
    return 'white';
  }

  // Both armies still have cards to fight with.
  return undefined;
}
