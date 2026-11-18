import type { AuthoritativeGameState, SpectatorGameState } from '@game';

import { toHiddenCardState } from '../cards/toHiddenCardState';

/**
 * The game state as a spectator sees it. A spectator holds neither hand, and
 * command cards are chosen in secret (§4.1.1), so both hands and both cards
 * waiting to be played are face down. The board and the public piles stay in
 * view.
 *
 * @param state - The authoritative game state
 * @returns The game state as a spectator sees it
 */
export function projectSpectatorGameState(
  state: AuthoritativeGameState,
): SpectatorGameState {
  const { cardState } = state;

  // A spectator owns neither hand, so both sides' private piles are face down.
  const spectator: SpectatorGameState = {
    ...state,
    cardState: {
      black: toHiddenCardState(cardState.black),
      visibility: 'spectator',
      white: toHiddenCardState(cardState.white),
    },
    visibility: 'spectator',
  };

  // The view a spectator is sent and folds its events onto.
  return spectator;
}
