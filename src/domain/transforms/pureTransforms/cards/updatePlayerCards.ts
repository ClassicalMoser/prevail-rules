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
 *
 * TODO(misleading): §4.1.2 is the reveal of both played cards; that a hand
 * is secret is §1.4. Settle by citing §1.4.
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
 * The rally, rout-discard and commitment applies call it.
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
  // Whether this view can see the player's hand decides which change runs.
  const { cardState } = state;
  const owned = findOwnedPlayerCardState(cardState, player);

  // A hand out of view: an opponent's at a seat, or either at a spectator's.
  // The change runs on the face-down piles.
  if (owned === undefined) {
    const hidden = getHiddenPlayerCardState(cardState, player);
    const hiddenChanged = change.hidden(hidden);
    const hiddenCardState = replaceHiddenPlayerCardState(
      cardState,
      player,
      hiddenChanged,
    );
    const withHiddenChanged = replaceCardState(state, hiddenCardState);
    return withHiddenChanged;
  }

  // A hand in view: the full record's, or a seat's own. The change runs on
  // the cards themselves.
  const ownedChanged = change.owned(owned);
  const ownedCardState = replaceOwnedPlayerCardState(
    cardState,
    player,
    ownedChanged,
  );
  const withOwnedChanged = replaceCardState(state, ownedCardState);
  return withOwnedChanged;
}
