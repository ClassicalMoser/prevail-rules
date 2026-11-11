import type { PlayerSide } from '@entities';
import type {
  AuthoritativeGameState,
  BlackSeenGameState,
  GameState,
  GameStateVisibility,
  SeenRoundState,
  SpectatorGameState,
  WhiteSeenGameState,
} from '@game';

import { toHiddenCardState } from '../cards/toHiddenCardState';
import { projectEventForVisibility } from './projectEventForVisibility';

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

  // The round's log goes to the viewer as the viewer would have received each
  // event, so a card the opponent laid face down is not in it.
  const roundFor = (observer: PlayerSide | 'spectator'): SeenRoundState => ({
    ...state.currentRoundState,
    events: state.currentRoundState.events.map((event) =>
      projectEventForVisibility(event, observer),
    ),
  });

  switch (visibility) {
    case 'whiteSeen': {
      // White keeps their own cards; black's private piles are hidden.
      const whiteSeen: WhiteSeenGameState = {
        ...state,
        currentRoundState: roundFor('white'),
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
        currentRoundState: roundFor('black'),
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
        currentRoundState: roundFor('spectator'),
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
