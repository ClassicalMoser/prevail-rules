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
 */
export function revealBothAwaitingCards<C extends CardState>(
  cardState: C,
  revealed: { black: CommandCard; white: CommandCard },
): C {
  switch (cardState.visibility) {
    case 'authoritative': {
      const authoritativeCardState: C = {
        ...cardState,
        black: revealCard(cardState.black),
        white: revealCard(cardState.white),
      };
      return authoritativeCardState;
    }
    case 'whiteSeen': {
      const whiteSeenCardState: C = {
        ...cardState,
        black: revealHiddenCard(cardState.black, revealed.black),
        white: revealCard(cardState.white),
      };
      return whiteSeenCardState;
    }
    case 'blackSeen': {
      const blackSeenCardState: C = {
        ...cardState,
        black: revealCard(cardState.black),
        white: revealHiddenCard(cardState.white, revealed.white),
      };
      return blackSeenCardState;
    }
    default: {
      const _exhaustive: never = cardState;
      throw new Error(`Invalid card state: ${_exhaustive}`);
    }
  }
}
