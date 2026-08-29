import type { CardState } from '@game';

import { moveCardToPlayed } from './moveCardToPlayed';

/**
 * Moves both players' inPlay cards to their played piles on a {@link CardState}.
 * Visibility discriminant is preserved — no casts.
 * Works for owned and hidden slices (`inPlay` / `played` are public on both).
 */
export function moveBothInPlayToPlayed(cardState: CardState): CardState {
  switch (cardState.visibility) {
    case 'authoritative': {
      return {
        visibility: 'authoritative',
        black: moveCardToPlayed(cardState.black),
        white: moveCardToPlayed(cardState.white),
      };
    }
    case 'whiteSeen': {
      return {
        visibility: 'whiteSeen',
        black: moveCardToPlayed(cardState.black),
        white: moveCardToPlayed(cardState.white),
      };
    }
    case 'blackSeen': {
      return {
        visibility: 'blackSeen',
        black: moveCardToPlayed(cardState.black),
        white: moveCardToPlayed(cardState.white),
      };
    }
    default: {
      const _exhaustive: never = cardState;
      throw new Error(`Invalid card state: ${_exhaustive}`);
    }
  }
}
