import type { PlayerSide } from '@entities';
import type { GameState, HiddenCardState, OwnedCardState } from '@game';
import { findOwnedPlayerCardState, getHiddenPlayerCardState } from '@queries';
import { replaceCardState } from './replaceCardState';
import { replaceHiddenPlayerCardState } from './replaceHiddenPlayerCardState';
import { replaceOwnedPlayerCardState } from './replaceOwnedPlayerCardState';

/**
 * How one player's cards change, for each way a seat can hold them. A hand is
 * in view to the full record and to its owner's seat; an opponent's seat and a
 * spectator see only how many cards it holds (§4.1.2).
 */
export interface PlayerCardsChange {
  /** The change where this view can see the player's cards. */
  owned: (cards: OwnedCardState) => OwnedCardState;
  /** The change where it can see only their number. */
  hidden: (cards: HiddenCardState) => HiddenCardState;
}

/**
 * Changes one player's cards in whichever form this view holds them. Every
 * seat applies the same event, so each says what it does to the cards it can
 * see and to the ones it cannot; this chooses between them and writes the
 * result back.
 *
 * @param state - The game state, under some card visibility
 * @param player - The player whose cards change
 * @param change - What happens to their cards, seen and unseen
 * @returns The game state with that player's cards changed
 */
export function updatePlayerCards<S extends GameState>(
  state: S,
  player: PlayerSide,
  change: PlayerCardsChange,
): S {
  const { cardState } = state;
  const owned = findOwnedPlayerCardState(cardState, player);
  if (owned === undefined) {
    const hidden = getHiddenPlayerCardState(cardState, player);
    return replaceCardState(
      state,
      replaceHiddenPlayerCardState(cardState, player, change.hidden(hidden)),
    );
  }
  return replaceCardState(
    state,
    replaceOwnedPlayerCardState(cardState, player, change.owned(owned)),
  );
}
