import type { PlayerSide } from '@entities';
import type { GameState } from '@game';

/**
 * Empty-hand loss rule: either hand empty means the other player wins.
 * Both empty is a draw (`null`). Neither empty → game continues (`undefined`).
 */
export function getWinnerFromEmptyHands(
  state: GameState,
): PlayerSide | null | undefined {
  const whiteEmpty = state.cardState.white.inHand.length === 0;
  const blackEmpty = state.cardState.black.inHand.length === 0;

  if (whiteEmpty && blackEmpty) {
    return null;
  }
  if (whiteEmpty) {
    return 'black';
  }
  if (blackEmpty) {
    return 'white';
  }
  return undefined;
}
