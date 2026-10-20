import type { GameForVisibility, GameStateVisibility } from '@game';

import { toHiddenCardState } from '../cards/toHiddenCardState';

/**
 * Projects an authoritative game into a visible game for wire reconcile.
 * A seat hides the opponent. A spectator hides both hands and both awaiting-play cards.
 * Public piles (in play, played, discarded, burnt) stay readable.
 */
export function projectGameForVisibility<
  V extends Exclude<GameStateVisibility, 'authoritative'>,
>(
  game: GameForVisibility<'authoritative'>,
  visibility: V,
): GameForVisibility<V> {
  const { cardState } = game.gameState;

  switch (visibility) {
    case 'whiteSeen': {
      // White keeps their own cards; black's private piles are hidden.
      const projected = {
        ...game,
        gameState: {
          ...game.gameState,
          cardState: {
            black: toHiddenCardState(cardState.black),
            visibility: 'whiteSeen',
            white: cardState.white,
          },
        },
      } as GameForVisibility<V>;
      return projected;
    }
    case 'blackSeen': {
      // Black keeps their own cards; white's private piles are hidden.
      const projected = {
        ...game,
        gameState: {
          ...game.gameState,
          cardState: {
            black: cardState.black,
            visibility: 'blackSeen',
            white: toHiddenCardState(cardState.white),
          },
        },
      } as GameForVisibility<V>;
      return projected;
    }
    case 'spectator': {
      // A spectator owns neither hand.
      const projected = {
        ...game,
        gameState: {
          ...game.gameState,
          cardState: {
            black: toHiddenCardState(cardState.black),
            visibility: 'spectator',
            white: toHiddenCardState(cardState.white),
          },
        },
      } as GameForVisibility<V>;
      return projected;
    }
    default: {
      const _exhaustive: never = visibility;
      throw new Error(`Invalid visibility: ${_exhaustive}`);
    }
  }
}
