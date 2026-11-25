import type { AuthoritativeGameState } from '@game';
import { createChooseRoutDiscardEvent, createEmptyGameState } from '@factories';
import {
  createPlayCardsPhaseState,
  createPlayableGame,
  createTestCard,
  withRoutOwing,
} from '@testing';
import { updatePhaseState, updatePlayerCardState } from '@transforms';

import { isValidChooseRoutDiscardEvent } from './isValidChooseRoutDiscardEvent';

/**
 * A routed unit's owner discards cards equal to its Morale, chosen freely
 * from their hand (§9.3.2). The discard is face up, so each card must be
 * shown as the hand holds it.
 *
 * White's unit has routed at its rally's support check. White holds three
 * stand-in cards; a fourth is the card that rally burnt.
 */
describe('isValidChooseRoutDiscardEvent function', () => {
  const first = createTestCard();
  const second = createTestCard();
  const third = createTestCard();
  const burnt = createTestCard();

  /** White owing a discard of this many cards. */
  function whiteOwing(numberToDiscard: number): AuthoritativeGameState {
    const game = createPlayableGame([], {
      hands: { white: [first, second, third] },
      initiative: 'white',
    });

    // The rally burnt one played card and took the rest back into hand
    // (§10.3.2).
    const afterBurn = updatePlayerCardState(game, 'white', {
      ...game.cardState.white,
      burnt: [burnt],
    });
    const owing = withRoutOwing(afterBurn, 'white', numberToDiscard);
    return owing;
  }

  it('accepts the Morale owed, paid in distinct cards from hand in any order', () => {
    // The cards are the owner's free choice (§9.3.2), and order means
    // nothing.
    const event = createChooseRoutDiscardEvent({
      cards: [third, first],
      player: 'white',
    });

    expect(isValidChooseRoutDiscardEvent(event, whiteOwing(2))).toStrictEqual({
      result: true,
    });
  });

  it("rejects a discard that bears a hand card's id but shows a different card", () => {
    // A discard is face up, so every seat folds the cards the event shows;
    // each must be the card the hand holds.
    // The altered card comes second, so the check must reach past a card
    // that is shown truly.
    const event = createChooseRoutDiscardEvent({
      cards: [first, { ...third, cost: third.cost + 5 }],
      player: 'white',
    });

    expect(isValidChooseRoutDiscardEvent(event, whiteOwing(2))).toStrictEqual({
      errorReason: `Card ${third.id} differs from the card held in its cost`,
      result: false,
    });
  });

  it('refuses fewer cards than the Morale owed', () => {
    // Two are owed; paying one would leave the rout half paid.
    const event = createChooseRoutDiscardEvent({
      cards: [first],
      player: 'white',
    });

    expect(isValidChooseRoutDiscardEvent(event, whiteOwing(2))).toStrictEqual({
      errorReason: 'Expected 2 cards, got 1',
      result: false,
    });
  });

  it('refuses one card named twice', () => {
    // A card is one card (§3.1.5); naming it twice pays one card for two.
    const event = createChooseRoutDiscardEvent({
      cards: [first, first],
      player: 'white',
    });

    expect(isValidChooseRoutDiscardEvent(event, whiteOwing(2))).toStrictEqual({
      errorReason: 'Duplicate card IDs in discard selection',
      result: false,
    });
  });

  it('refuses a card that is not in hand', () => {
    // A burnt card is gone from the game for good (§10.1), so it cannot pay.
    const event = createChooseRoutDiscardEvent({
      cards: [burnt],
      player: 'white',
    });

    expect(isValidChooseRoutDiscardEvent(event, whiteOwing(1))).toStrictEqual({
      errorReason: `Command card ${burnt.id} is not a legal discard for white`,
      result: false,
    });
  });

  it('refuses a discard from the player whose unit did not rout', () => {
    // Each owner pays for their own unit (§9.3.3).
    const event = createChooseRoutDiscardEvent({
      cards: [first],
      player: 'black',
    });

    expect(isValidChooseRoutDiscardEvent(event, whiteOwing(1))).toStrictEqual({
      errorReason: 'Expected rout discard from white, got black',
      result: false,
    });
  });

  it('throws when asked where no rout awaits a discard, which the expected check rules out first', () => {
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );
    const event = createChooseRoutDiscardEvent({
      cards: [first],
      player: 'white',
    });

    // A discard sent while cards are chosen is refused by the expected check
    // before membership is asked; reaching here is a fault.
    expect(() => isValidChooseRoutDiscardEvent(event, state)).toThrow(
      'No rout is awaiting a discard',
    );
  });
});
