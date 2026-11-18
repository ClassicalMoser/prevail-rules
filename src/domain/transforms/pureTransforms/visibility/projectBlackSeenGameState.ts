import type { AuthoritativeGameState, BlackSeenGameState } from '@game';

import { toHiddenCardState } from '../cards/toHiddenCardState';

/**
 * The game state as black's seat sees it. Command cards are chosen in secret
 * (§4.1.1), so white's hand and the card white is waiting to play are face
 * down; black keeps its own. The board and the public piles stay in view.
 *
 * @param state - The authoritative game state
 * @returns The game state as black sees it
 */
export function projectBlackSeenGameState(
  state: AuthoritativeGameState,
): BlackSeenGameState {
  const { cardState } = state;

  // Black keeps its own cards; white's private piles are turned face down.
  const blackSeen: BlackSeenGameState = {
    ...state,
    cardState: {
      black: cardState.black,
      visibility: 'blackSeen',
      white: toHiddenCardState(cardState.white),
    },
    visibility: 'blackSeen',
  };

  // The view black's seat is sent and folds its events onto.
  return blackSeen;
}
