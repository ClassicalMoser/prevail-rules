import type { CardState } from '@game';

import { moveCardToPlayed } from './moveCardToPlayed';

/**
 * Moves both players' inPlay cards to their played piles on a {@link CardState}.
 * Visibility discriminant is preserved — no casts.
 * Works for owned and hidden slices (`inPlay` / `played` are public on both).
 *
 * Cleanup opens with both players putting this round's card onto their
 * played pile (§4.5.1), which is what a rally later burns from.
 * `applyCardsLeavePlayEvent` calls it.
 *
 * @param cardState - Both players' cards, under any visibility
 * @returns The same visibility, with both cards in play moved to played
 * @throws Error when the visibility is not one the game knows
 */
export function moveBothInPlayToPlayed(cardState: CardState): CardState {
  // Each branch is written out so the visibility tag and its slices stay
  // paired in the type; the move itself is the same in every view.
  switch (cardState.visibility) {
    case 'authoritative': {
      // The full record: both sides' cards are owned.
      const authoritative: CardState = {
        visibility: 'authoritative',
        black: moveCardToPlayed(cardState.black),
        white: moveCardToPlayed(cardState.white),
      };
      return authoritative;
    }
    case 'whiteSeen': {
      // White's seat: the card in play is face up, so black's moves too.
      const whiteSeen: CardState = {
        visibility: 'whiteSeen',
        black: moveCardToPlayed(cardState.black),
        white: moveCardToPlayed(cardState.white),
      };
      return whiteSeen;
    }
    case 'blackSeen': {
      // Black's seat: the card in play is face up, so white's moves too.
      const blackSeen: CardState = {
        visibility: 'blackSeen',
        black: moveCardToPlayed(cardState.black),
        white: moveCardToPlayed(cardState.white),
      };
      return blackSeen;
    }
    case 'spectator': {
      // inPlay and played are public on a hidden slice, so both seats move.
      const spectator: CardState = {
        visibility: 'spectator',
        black: moveCardToPlayed(cardState.black),
        white: moveCardToPlayed(cardState.white),
      };
      return spectator;
    }
    default: {
      // Every visibility is handled above; only a value the type forbids
      // arrives here.
      // TODO(misleading): the message interpolates the whole card state, so
      // it reads 'Invalid card state: [object Object]'. Settle by switching
      // on a named `visibility` and printing it, as
      // `getHiddenPlayerCardState` does.
      const _exhaustive: never = cardState;
      throw new Error(`Invalid card state: ${_exhaustive}`);
    }
  }
}
