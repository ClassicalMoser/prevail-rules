import type {
  AuthoritativeGameState,
  BlackSeenGameState,
  GameState,
  GameStateVisibility,
  SpectatorGameState,
  WhiteSeenGameState,
} from '@game';

import { toHiddenCardState } from '../cards/toHiddenCardState';

/**
 * Projects the authoritative game state into what one viewer may see, for
 * wire reconcile. A seat hides the opponent's hand and awaiting card; a
 * spectator hides both. Public piles (in play, played, discarded, burnt) and
 * the board stay readable.
 *
 * @param state - The authoritative game state
 * @param visibility - What the viewer may see
 * @returns The game state as that viewer sees it
 */
export function projectGameStateForVisibility(
  state: AuthoritativeGameState,
  visibility: Exclude<GameStateVisibility, 'authoritative'>,
): GameState {
  const { cardState } = state;

  switch (visibility) {
    case 'whiteSeen': {
      // White keeps their own cards; black's private piles are hidden.
      const whiteSeen: WhiteSeenGameState = {
        ...state,
        cardState: {
          black: toHiddenCardState(cardState.black),
          visibility: 'whiteSeen',
          white: cardState.white,
        },
        visibility: 'whiteSeen',
      };
      return whiteSeen;
    }
    case 'blackSeen': {
      // Black keeps their own cards; white's private piles are hidden.
      const blackSeen: BlackSeenGameState = {
        ...state,
        cardState: {
          black: cardState.black,
          visibility: 'blackSeen',
          white: toHiddenCardState(cardState.white),
        },
        visibility: 'blackSeen',
      };
      return blackSeen;
    }
    case 'spectator': {
      // A spectator owns neither hand.
      const spectator: SpectatorGameState = {
        ...state,
        cardState: {
          black: toHiddenCardState(cardState.black),
          visibility: 'spectator',
          white: toHiddenCardState(cardState.white),
        },
        visibility: 'spectator',
      };
      return spectator;
    }
    default: {
      const _exhaustive: never = visibility;
      throw new Error(`Invalid visibility: ${_exhaustive}`);
    }
  }
}
