import type { GameForVisibility, GameStateVisibility } from '@game';

import { toHiddenCardState } from '../cards/toHiddenCardState';

/**
 * Projects an authoritative game into a seat-visible game for wire reconcile.
 */
export function projectGameForVisibility<
  V extends Exclude<GameStateVisibility, 'authoritative'>,
>(
  game: GameForVisibility<'authoritative'>,
  visibility: V,
): GameForVisibility<V> {
  const { cardState } = game.gameState;

  if (visibility === 'whiteSeen') {
    return {
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
  }

  return {
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
}
