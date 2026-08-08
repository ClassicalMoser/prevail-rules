import type { PlayerSide } from '@entities';
import type { GameForVisibility, GameStateVisibility } from '@game';

import { toHiddenCardState } from '../cards/toHiddenCardState';

/**
 * Projects an authoritative game into a seat-visible game for wire reconcile.
 */
export function projectGameForVisibility<V extends Exclude<GameStateVisibility, 'authoritative'>>(
  game: GameForVisibility<'authoritative'>,
  visibility: V,
): GameForVisibility<V> {
  const { cardState } = game.gameState;
  const ownedSide: PlayerSide = visibility === 'whiteSeen' ? 'white' : 'black';
  const hiddenSide: PlayerSide = ownedSide === 'white' ? 'black' : 'white';

  return {
    ...game,
    gameState: {
      ...game.gameState,
      cardState: {
        visibility,
        [ownedSide]: cardState[ownedSide],
        [hiddenSide]: toHiddenCardState(cardState[hiddenSide]),
      },
    },
  } as GameForVisibility<V>;
}
