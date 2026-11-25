import type { CommandCard } from '@entities';
import type { CardState } from '@game';

import { revealCard } from './revealCard';
import { revealHiddenCard } from './revealHiddenCard';

/**
 * Reveals both players' awaitingPlay cards on a {@link CardState}.
 *
 * Owned slices use state-driven {@link revealCard}. Hidden slices use
 * {@link revealHiddenCard} with the provided revealed card identities.
 *
 * Generic over the card-state **object** (`C extends CardState`): the switch
 * narrows `C`, and spreading `cardState` returns `C` without assertions.
 *
 * Both face-down cards are turned over together, and each is now in play for
 * the round (§4.1.2). `applyRevealCardsEvent` calls it.
 *
 * @param cardState - Both players' cards, each with a card waiting face down
 * @param revealed - The two cards as the reveal event shows them
 * @returns The same visibility, with both waiting cards in play
 * @throws Error when either player has no card waiting, or the visibility is
 *   not one the game knows
 */
export function revealBothAwaitingCards<C extends CardState>(
  cardState: C,
  revealed: { black: CommandCard; white: CommandCard },
): C {
  switch (cardState.visibility) {
    case 'authoritative': {
      // The full record holds both waiting cards, so each hand's own copy
      // goes into play and the event's copies are not read.
      const authoritativeCardState: C = {
        ...cardState,
        black: revealCard(cardState.black),
        white: revealCard(cardState.white),
      };
      return authoritativeCardState;
    }
    case 'whiteSeen': {
      // White's seat holds its own waiting card; black's was face down, so
      // the event's copy is the only one there is.
      const whiteSeenCardState: C = {
        ...cardState,
        black: revealHiddenCard(cardState.black, revealed.black),
        white: revealCard(cardState.white),
      };
      return whiteSeenCardState;
    }
    case 'blackSeen': {
      // Black's seat holds its own waiting card; white's was face down, so
      // the event's copy is the only one there is.
      const blackSeenCardState: C = {
        ...cardState,
        black: revealCard(cardState.black),
        white: revealHiddenCard(cardState.white, revealed.white),
      };
      return blackSeenCardState;
    }
    case 'spectator': {
      // Neither awaiting card is stored, so both identities come from the payload.
      const spectatorCardState: C = {
        ...cardState,
        black: revealHiddenCard(cardState.black, revealed.black),
        white: revealHiddenCard(cardState.white, revealed.white),
      };
      return spectatorCardState;
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
