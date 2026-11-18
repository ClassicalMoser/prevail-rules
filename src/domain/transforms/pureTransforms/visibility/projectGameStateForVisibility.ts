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
  switch (visibility) {
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
      const _exhaustive: never = visibility;
      throw new Error(`Invalid visibility: ${_exhaustive}`);
    }
  }
}
