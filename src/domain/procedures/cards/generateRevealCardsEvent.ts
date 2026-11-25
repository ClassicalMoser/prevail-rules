import type { RevealCardsEvent } from '@events';
import type { AuthoritativeGameState } from '@game';
import { GAME_EFFECT_EVENT_TYPE, REVEAL_CARDS_EFFECT_TYPE } from '@events';
import { getOwnedPlayerCardState } from '@queries';

/**
 * Generates a RevealCardsEvent by baking both players' awaitingPlay cards into
 * the event payload. This makes hidden information public for seen-visibility
 * applies that cannot read opponent hands.
 *
 * @param state - The current game state (must have both awaitingPlay set and be authoritative)
 * @returns A complete RevealCardsEvent with black/white card payloads
 * @throws Error if either player has no card awaiting play
 */
export function generateRevealCardsEvent(
  state: AuthoritativeGameState,
): RevealCardsEvent {
  // Each card waits face down where only its owner can see it (§4.1.1), so
  // only the full record holds both; that is why this procedure takes the
  // authoritative state. Each side's own piles hold its waiting card.
  const blackCardState = getOwnedPlayerCardState(state.cardState, 'black');
  const whiteCardState = getOwnedPlayerCardState(state.cardState, 'white');
  const blackCard = blackCardState.awaitingPlay;
  const whiteCard = whiteCardState.awaitingPlay;

  // The cards are revealed together, once both are chosen (§4.1.2). The
  // expected engine asks only then, so a side with no card waiting is a
  // fault in the state.
  if (!blackCard) {
    throw new Error('Black player has no card awaiting play');
  }

  if (!whiteCard) {
    throw new Error('White player has no card awaiting play');
  }

  // Both cards go on the event, the state's own copies. A seat that could not
  // see the opponent's face-down card learns it here, and its apply puts the
  // card in play from the event.
  const revealCards: RevealCardsEvent = {
    effectType: REVEAL_CARDS_EFFECT_TYPE,
    eventType: GAME_EFFECT_EVENT_TYPE,
    black: blackCard,
    white: whiteCard,
  };

  // The effect that turns both cards face up and puts them in play.
  return revealCards;
}
