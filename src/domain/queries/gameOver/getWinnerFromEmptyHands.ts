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
export function getWinnerFromEmptyHands(
  state: GameState,
): PlayerSide | undefined {
  // A card chosen in Phase 1 stays face down until both are revealed together
  // (§4.1.1, §4.1.2), so a hand emptied by choosing is not empty of play yet:
  // the game is lost when the card goes into play, not while the other player
  // is still choosing.
  const whiteEmpty =
    state.cardState.white.inHand.length === 0 &&
    state.cardState.white.awaitingPlay === null;
  const blackEmpty =
    state.cardState.black.inHand.length === 0 &&
    state.cardState.black.awaitingPlay === null;

  if (whiteEmpty && blackEmpty) {
    // Both armies' will to fight gave out in the same instant, which only
    // happens when both played their last card face-down in Phase 1. Those
    // commitments were made before either card was revealed, so the tie goes
    // to the initiative held going into the round (§11.3) — still unrewritten
    // here, because the new initiative is only assigned after the reveal.
    const tieWinner = state.currentInitiative;
    return tieWinner;
  }
  if (whiteEmpty) {
    return 'black';
  }
  if (blackEmpty) {
    return 'white';
  }
  return undefined;
}
