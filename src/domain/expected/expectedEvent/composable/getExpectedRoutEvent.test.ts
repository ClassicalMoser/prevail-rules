import { createRoutState, createTestUnit } from '@testing';

import { getExpectedRoutEvent } from './getExpectedRoutEvent';

/**
 * GetExpectedRoutEvent: next rout sub-step as a game effect or player choice from rout-resolution state.
 */
describe('getExpectedRoutEvent function', () => {
  it('a rout just opened waits on the engine to count the Morale it costs', () => {
    // White's unit routs; what it costs is not counted yet.
    const routState = createRoutState('white', createTestUnit('white'));

    // Counting Morale is the engine's work (§9.3.2).
    expect(getExpectedRoutEvent(routState)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRout',
    });
  });

  it('a counted Morale debt waits on the owner of the routing unit to choose the cards', () => {
    // Black's unit routs and costs two cards, not yet chosen.
    const routState = createRoutState('black', createTestUnit('black'), {
      numberToDiscard: 2,
    });

    // The owner chooses freely from their own hand (§9.3.2).
    expect(getExpectedRoutEvent(routState)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseRoutDiscard',
      playerSource: 'black',
    });
  });

  it('a paid rout has nothing left to ask for, so asking throws', () => {
    // The one card owed was chosen and the rout closed.
    const routState = createRoutState('white', createTestUnit('white'), {
      cardsChosen: true,
      completed: true,
      numberToDiscard: 1,
    });

    // Its parent should have moved on.
    expect(() => getExpectedRoutEvent(routState)).toThrow(
      'Rout state is already complete',
    );
  });

  it('a rout whose cards are chosen but left open throws, since paying closes it', () => {
    // The card was chosen, yet the rout still reads open: a fault in the
    // write that recorded the choice.
    const routState = createRoutState('white', createTestUnit('white'), {
      cardsChosen: true,
      numberToDiscard: 1,
    });

    expect(() => getExpectedRoutEvent(routState)).toThrow(
      'Rout state has cards chosen but not marked as completed',
    );
  });
});
