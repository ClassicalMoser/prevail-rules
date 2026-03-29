import type { Board } from '@entities';
import type { ChooseCardEvent } from '@events';
import type { GameState } from '@game';
import { PLAYER_CHOICE_EVENT_TYPE } from '@events';

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
  const currentPhaseState = gameState.currentRoundState?.currentPhaseState;
  if (!currentPhaseState || currentPhaseState.phase !== 'playCards') {
    return [];
  }
  if (currentPhaseState.step !== 'chooseCards') {
    return [];
  }

  const eventNumber = gameState.currentRoundState.events.length;
  const { black, white } = gameState.cardState;
  const blackStillChoosing = black.awaitingPlay === null;
  const whiteStillChoosing = white.awaitingPlay === null;

  const result: ChooseCardEvent<TBoard>[] = [];
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
  return result;
}
