import type {
  AuthoritativeGameState,
  GameState,
  GameStateVisibility,
} from '@game';

import { projectBlackSeenGameState } from './projectBlackSeenGameState';
import { projectSpectatorGameState } from './projectSpectatorGameState';
import { projectWhiteSeenGameState } from './projectWhiteSeenGameState';

/**
 * Projects the authoritative game state into what one viewer may see, for
 * wire reconcile. A seat hides the opponent's hand and awaiting card; a
 * spectator hides both. Public piles (in play, played, discarded, burnt) and
 * the board stay readable. The authoritative view hides nothing, for a viewer
 * the server lets see every card.
 *
 * @param state - The authoritative game state
 * @param visibility - What the viewer may see
 * @returns The game state as that viewer sees it
 */
export function projectGameStateForVisibility(
  state: AuthoritativeGameState,
  visibility: GameStateVisibility,
): GameState {
  switch (visibility) {
    case 'authoritative': {
      // Every card is in view, so nothing is turned face down.
      const authoritative = state;
      return authoritative;
    }
    case 'whiteSeen': {
      // White keeps its own cards; black's private piles are hidden.
      const whiteSeen = projectWhiteSeenGameState(state);
      return whiteSeen;
    }
    case 'blackSeen': {
      // Black keeps its own cards; white's private piles are hidden.
      const blackSeen = projectBlackSeenGameState(state);
      return blackSeen;
    }
    case 'spectator': {
      // A spectator owns neither hand.
      const spectator = projectSpectatorGameState(state);
      return spectator;
    }
    default: {
      // The four views are every view there is; a value outside them is a
      // caller's fault, named in the message.
      const _exhaustive: never = visibility;
      throw new Error(`Invalid visibility: ${_exhaustive}`);
    }
  }
}
