import type { AuthoritativeGameState, WhiteSeenGameState } from '@game';

import { toHiddenCardState } from '../cards/toHiddenCardState';

/**
 * The game state as white's seat sees it. Command cards are chosen in secret
 * (§4.1.1), so black's hand and the card black is waiting to play are face
 * down; white keeps its own. The board and the public piles stay in view.
 *
 * @param state - The authoritative game state
 * @returns The game state as white sees it
 */
export function projectWhiteSeenGameState(
  state: AuthoritativeGameState,
): WhiteSeenGameState {
  const { cardState } = state;

  // White keeps its own cards; black's private piles are turned face down.
  const whiteSeen: WhiteSeenGameState = {
    ...state,
    cardState: {
      black: toHiddenCardState(cardState.black),
      visibility: 'whiteSeen',
      white: cardState.white,
    },
    visibility: 'whiteSeen',
  };

  // The view white's seat is sent and folds its events onto.
  return whiteSeen;
}
