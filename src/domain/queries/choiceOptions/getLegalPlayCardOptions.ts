import type { Board } from '@entities';
import type { ChooseCardEvent } from '@events';
import type { GameState } from '@game';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';
import {
  getNextEventNumber,
  getPlayCardsPhaseState,
} from '@queries/sequencing';

/**
 * Returns every legal play-card choice for the current state during the
 * play-cards "chooseCards" step: each pending player's in-hand cards as
 * complete {@link ChooseCardEvent} payloads (with `eventNumber` derived from
 * the round's event stream). Empty when no choice is expected (wrong
 * phase/step or both players have already committed a card for this reveal).
 *
 * Aligns with {@link isValidChooseCardEvent} and
 * {@link getExpectedPlayCardsPhaseEvent} for the chooseCards step.
 */
export function getLegalPlayCardOptions<TBoard extends Board>(
  gameState: GameState<TBoard>,
): ChooseCardEvent<TBoard>[] {
  // Make sure we're in the choose cards step
  const phaseState = getPlayCardsPhaseState(gameState);
  if (phaseState.step !== 'chooseCards') {
    throw new Error('Not in choose cards step');
  }

  // Get the next event number
  const eventNumber = getNextEventNumber(gameState);

  // See who has legal choices
  const { black, white } = gameState.cardState;
  const blackStillChoosing = black.awaitingPlay === null;
  const whiteStillChoosing = white.awaitingPlay === null;

  // Build the result
  const result: ChooseCardEvent<TBoard>[] = [];

  // If black is still choosing, add all the cards in their hand as legal choices
  if (blackStillChoosing) {
    for (const card of black.inHand) {
      result.push({
        eventNumber,
        eventType: PLAYER_CHOICE_EVENT_TYPE,
        choiceType: 'chooseCard',
        player: 'black',
        card,
      });
    }
  }

  // If white is still choosing, add all the cards in their hand as legal choices
  if (whiteStillChoosing) {
    for (const card of white.inHand) {
      result.push({
        eventNumber,
        eventType: PLAYER_CHOICE_EVENT_TYPE,
        choiceType: 'chooseCard',
        player: 'white',
        card,
      });
    }
  }

  // Return the result
  return result;
}
