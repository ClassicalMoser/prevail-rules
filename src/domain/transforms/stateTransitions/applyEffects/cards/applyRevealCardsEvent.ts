import type { RevealCardsEvent } from '@events';
import type { GameState } from '@game';
import { getPlayCardsPhaseState } from '@queries';
import {
  replaceCardState,
  revealBothAwaitingCards,
  updatePlayCardsStep,
} from '@transforms/pureTransforms';

/**
 * Applies a RevealCardsEvent to the game state.
 * Moves both players' awaitingPlay cards to inPlay, making them public.
 * Advances the play cards phase step to `assignInitiative`.
 *
 * Generic over the game-state **object** (`S extends GameState`): same
 * visibility member out as in. CommandCard branching lives in
 * {@link revealBothAwaitingCards}.
 *
 * Step is not re-validated; the event is trusted from the procedure / machine-generated
 * log. Phase is narrowed via {@link getPlayCardsPhaseState} (throws if not `playCards`).
 *
 * @param event - Both cards as they turn over
 * @param state - The game playing cards, both cards laid face down
 * @returns The game with both cards in play, initiative to be decided
 * @throws Error when the game is not playing cards, or a side has no card
 * laid down
 */
export function applyRevealCardsEvent<S extends GameState>(
  event: RevealCardsEvent,
  state: S,
): S {
  // Cards are revealed only while playing cards.
  // Asked first, so a reveal out of its phase is refused as that, before
  // any card is looked for.
  getPlayCardsPhaseState(state);

  // Both cards turn face up together (§4.1.2), and initiative is assigned
  // next.
  // Where this view can see a side's card, the copy the state holds is the
  // one turned over; the event's card is used only where the view saw
  // nothing but a face-down card, since there it is the only copy there is.
  const shown = { black: event.black, white: event.white };
  const cardsInPlay = revealBothAwaitingCards(state.cardState, shown);
  const revealed = replaceCardState(state, cardsInPlay);

  // With both cards in play, the lower initiative is compared next (§4.1.3).
  const assigning = updatePlayCardsStep(revealed, 'assignInitiative');

  // Both cards face up and in play for the round.
  return assigning;
}
