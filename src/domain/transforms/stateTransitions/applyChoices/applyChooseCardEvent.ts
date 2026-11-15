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

  // The card is chosen face down: hidden on a seat that cannot see this
  // player's hand, shown on one that can.
  const chosen =
    card === 'hidden'
      ? replaceCardState(
          state,
          replaceHiddenPlayerCardState(
            state.cardState,
            player,
            chooseHiddenCard(getHiddenPlayerCardState(state.cardState, player)),
          ),
        )
      : replaceCardState(
          state,
          replaceOwnedPlayerCardState(
            state.cardState,
            player,
            chooseCard(getOwnedPlayerCardState(state.cardState, player), card),
          ),
        );

  // Both players choose at once (§4.1.1). Once both cards are in, the
  // expected engine asks for the reveal.
  return chosen;
}
