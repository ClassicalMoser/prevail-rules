import { createChooseCardEvent } from '@factories';
import { getOwnedPlayerCardState } from '@queries';
import {
  applyEffectsUntilChoice,
  createPlayableGame,
  createPlayCardsPhaseState,
} from '@testing';
import { applyEvent, updatePhaseState } from '@transforms';
import { validatePlayerChoice } from '@validation';

/**
 * Playing the last card in each hand (§4.1.1, §11.1, §11.3), played through
 * the engines. Both players choose in secret and at the same time, and the
 * cards are revealed together, so a hand that empties by choosing is empty
 * only once the cards are in play — not while the other player is still
 * choosing.
 *
 * Each army has one unit and one card in hand. White held initiative going
 * into the round.
 */
function bothHoldTheirLastCard() {
  const game = createPlayableGame(
    [
      { coord: 'A-1', facing: 'south', player: 'white' },
      { coord: 'I-9', facing: 'north', player: 'black' },
    ],
    { hands: { black: 1, white: 1 }, initiative: 'white' },
  );
  return updatePhaseState(game, createPlayCardsPhaseState());
}

describe('both players playing their last card in Phase 1', () => {
  it('still waits on the second player after the first chooses its last card', () => {
    const start = bothHoldTheirLastCard();
    const [blackCard] = getOwnedPlayerCardState(
      start.cardState,
      'black',
    ).inHand;

    // Black chooses its only card, face down. White has not chosen yet.
    const chosen = applyEvent(
      createChooseCardEvent({
        card: blackCard,
        eventNumber: 0,
        player: 'black',
      }),
      start,
    );
    const { state, next } = applyEffectsUntilChoice(chosen);

    // Choosing is simultaneous: black's face-down card is not yet in play,
    // so black has not lost, and white is still to choose.
    expect(state.winner).toBeUndefined();
    expect(next).toMatchObject({
      choiceType: 'chooseCard',
      playerSource: 'white',
    });
  });

  it('gives the game to the initiative held going into the round, once both reveal', () => {
    const start = bothHoldTheirLastCard();
    const [blackCard] = getOwnedPlayerCardState(
      start.cardState,
      'black',
    ).inHand;
    const [whiteCard] = getOwnedPlayerCardState(
      start.cardState,
      'white',
    ).inHand;
    const blackChosen = applyEvent(
      createChooseCardEvent({
        card: blackCard,
        eventNumber: 0,
        player: 'black',
      }),
      start,
    );

    // White's choice is accepted: it is the move the game is waiting for.
    const whiteChoice = createChooseCardEvent({
      card: whiteCard,
      eventNumber: 1,
      player: 'white',
    });
    expect(validatePlayerChoice(whiteChoice, blackChosen).result).toBe(true);
    const bothChosen = applyEvent(whiteChoice, blackChosen);
    const { state, next } = applyEffectsUntilChoice(bothChosen);

    // Both hands are empty in the same instant, which only the reveal makes
    // so, and the cards were committed before either was shown (§11.3):
    // white, who held initiative going into the round, wins.
    expect(next).toBe('gameOver');
    expect(state.winner).toBe('white');
  });
});
