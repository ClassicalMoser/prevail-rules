import type { RevealCardsEvent } from '@events';
import type { GameStateForVisibility } from '@game';
import { GAME_EFFECT_EVENT_TYPE, REVEAL_CARDS_EFFECT_TYPE } from '@events';
import { getOwnedPlayerCardState } from '@queries';

/**
 * Generates a RevealCardsEvent by baking both players' awaitingPlay cards into
 * the event payload. This makes hidden information public for seen-visibility
 * applies that cannot read opponent hands.
 *
 * @param state - The current game state (must have both awaitingPlay set and be authoritative)
 * @param eventNumber - The ordered index of the event in the round
 * @returns A complete RevealCardsEvent with black/white card payloads
 * @throws Error if either player has no card awaiting play
 */
export function generateRevealCardsEvent(
  state: GameStateForVisibility<'authoritative'>,
  eventNumber: number,
): RevealCardsEvent {
  const blackCardState = getOwnedPlayerCardState(state.cardState, 'black');
  const whiteCardState = getOwnedPlayerCardState(state.cardState, 'white');
  const blackCard = blackCardState.awaitingPlay;
  const whiteCard = whiteCardState.awaitingPlay;

  if (!blackCard) {
    throw new Error('Black player has no card awaiting play');
  }

  if (!whiteCard) {
    throw new Error('White player has no card awaiting play');
  }

  return {
    effectType: REVEAL_CARDS_EFFECT_TYPE,
    eventNumber,
    eventType: GAME_EFFECT_EVENT_TYPE,
    black: blackCard,
    white: whiteCard,
  };
}
