import type { AuthoritativeGameState } from '@game';
import { createChooseCardEvent, createEmptyGameState } from '@factories';
import {
  createPlayCardsPhaseState,
  createPlayableGame,
  createTestCard,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { isValidChooseCardEvent } from './isValidChooseCardEvent';

/**
 * Both players choose a card from hand at once and lay it face down
 * (§4.1.1). A choice is legal when the card is in the chooser's own hand and
 * the event shows it as the hand holds it.
 *
 * Each player holds one stand-in card, and neither has chosen yet.
 */
describe('isValidChooseCardEvent function', () => {
  const blackCard = createTestCard();
  const whiteCard = createTestCard();

  /** Phase 1, both players still choosing. */
  function choosingCards(): AuthoritativeGameState {
    const game = createPlayableGame([], {
      hands: { black: [blackCard], white: [whiteCard] },
    });
    const choosing = updatePhaseState(game, createPlayCardsPhaseState());
    return choosing;
  }

  it('accepts a card from the chooser’s own hand', () => {
    const event = createChooseCardEvent({ card: blackCard, player: 'black' });

    expect(isValidChooseCardEvent(event, choosingCards())).toStrictEqual({
      result: true,
    });
  });

  it("rejects a card that bears a hand card's id but claims a different cost", () => {
    // The card is shown to every seat as it is chosen, so what the event
    // says the card is must be what the hand holds.
    const event = createChooseCardEvent({
      card: { ...blackCard, cost: blackCard.cost + 5 },
      player: 'black',
    });

    expect(isValidChooseCardEvent(event, choosingCards())).toStrictEqual({
      errorReason: `Card ${blackCard.id} differs from the card held in its cost`,
      result: false,
    });
  });

  it('refuses a card that is in the other player’s hand', () => {
    // Both hands are on offer while both choose, but White may play only
    // from its own.
    const event = createChooseCardEvent({ card: blackCard, player: 'white' });

    expect(isValidChooseCardEvent(event, choosingCards())).toStrictEqual({
      errorReason: `Command card ${blackCard.id} is not a legal choice for white`,
      result: false,
    });
  });

  it('refuses a card that is in no hand', () => {
    // A card the army does not hold: there is no hand card to compare it with,
    // so the refusal names the card, not a part of it.
    const stranger = createTestCard();
    const event = createChooseCardEvent({ card: stranger, player: 'black' });

    expect(isValidChooseCardEvent(event, choosingCards())).toStrictEqual({
      errorReason: `Command card ${stranger.id} is not a legal choice for black`,
      result: false,
    });
  });

  it('throws when asked off the chooseCards step, which the expected check rules out first', () => {
    // Phase 1 after both cards are in, when they are compared.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'assignInitiative' }),
    );
    const event = createChooseCardEvent({ card: blackCard, player: 'black' });

    // A choice sent out of turn is refused by the expected check before
    // membership is asked; reaching here is a fault.
    expect(() => isValidChooseCardEvent(event, state)).toThrow(
      'Not on the chooseCards step: assignInitiative',
    );
  });
});
