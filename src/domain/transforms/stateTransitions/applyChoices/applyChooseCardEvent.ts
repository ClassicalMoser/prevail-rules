import type { ChooseCardEvent, ProjectedChooseCardEvent } from '@events';
import type { GameState } from '@game';
import { getHiddenPlayerCardState, getOwnedPlayerCardState } from '@queries';
import {
  chooseCard,
  chooseHiddenCard,
  replaceCardState,
  replaceHiddenPlayerCardState,
  replaceOwnedPlayerCardState,
} from '@transforms/pureTransforms';

/**
 * The card chosen in Phase 1, as the full record holds it, or as a seat that
 * cannot see the chooser's hand receives it: `'hidden'`, since the card lies
 * face down until both are revealed (§4.1.1).
 */
type ChooseCardApplyEvent = ChooseCardEvent | ProjectedChooseCardEvent;

/**
 * Applies a choose-card event to authoritative or seat-visible state.
 *
 * Concrete cards use the owned slice; `'hidden'` uses the unowned slice via
 * {@link chooseHiddenCard}. Ownership is proven by
 * {@link getOwnedPlayerCardState} / {@link getHiddenPlayerCardState}.
 */
export function applyChooseCardEvent<S extends GameState>(
  event: ChooseCardApplyEvent,
  state: S,
): S {
  const { player, card } = event;

  // TODO(composition): the two branches below rebuild `updatePlayerCards`, but
  // choose by the event's card ('hidden' or not) where `updatePlayerCards`
  // chooses by whether this view can see the hand. They differ only on a
  // mismatch: a shown card against a hidden hand, or `'hidden'` against a hand in
  // view, throws here from the getter, and would be folded quietly there. Settle
  // by deciding whether that mismatch is a fault worth its throw; if not, call
  // `updatePlayerCards` and drop the branch.

  // The card is chosen face down: hidden on a seat that cannot see this
  // player's hand, shown on one that can.
  if (card === 'hidden') {
    // A seat that cannot see the hand knows only that one card left it to lie
    // face down, not which (§4.1.1).
    const hidden = getHiddenPlayerCardState(state.cardState, player);
    const chosenHidden = chooseHiddenCard(hidden);
    const hiddenCards = replaceHiddenPlayerCardState(
      state.cardState,
      player,
      chosenHidden,
    );
    const hiddenChosen = replaceCardState(state, hiddenCards);

    // Both players choose at once (§4.1.1). Once both cards are in, the
    // expected engine asks for the reveal.
    return hiddenChosen;
  }

  // Where the hand is in view, the card named leaves it to lie face down until
  // the reveal; `chooseCard` takes the hand's own copy.
  const owned = getOwnedPlayerCardState(state.cardState, player);
  const chosenOwned = chooseCard(owned, card);
  const ownedCards = replaceOwnedPlayerCardState(
    state.cardState,
    player,
    chosenOwned,
  );
  const chosen = replaceCardState(state, ownedCards);

  // Both players choose at once (§4.1.1). Once both cards are in, the
  // expected engine asks for the reveal.
  return chosen;
}
