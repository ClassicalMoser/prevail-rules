import { createRoutState, createTestUnit } from '@testing';

import { getExpectedRoutEvent } from './getExpectedRoutEvent';

/**
 * GetExpectedRoutEvent: next rout sub-step as a game effect or player choice from rout-resolution state.
 */
describe(getExpectedRoutEvent, () => {
  it('given the rout has not been resolved yet, requests rout resolution', () => {
    const routState = createRoutState('black', createTestUnit('white'));

    expect(getExpectedRoutEvent(routState)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRout',
    });
  });

  it('given cards have not been chosen, asks the routed player to choose discard', () => {
    const routState = createRoutState('white', createTestUnit('black'), {
      cardsChosen: false,
      numberToDiscard: 2,
    });

    expect(getExpectedRoutEvent(routState)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'chooseRoutDiscard',
      playerSource: 'white',
    });
  });

  it('given when the rout is already complete, throws', () => {
    const routState = createRoutState('black', createTestUnit('white'), {
      cardsChosen: true,
      completed: true,
      numberToDiscard: 1,
    });

    expect(() => getExpectedRoutEvent(routState)).toThrow(
      'Rout state is already complete',
    );
  });

  it('given when cards are chosen but the rout is not marked complete, throws', () => {
    const routState = createRoutState('black', createTestUnit('white'), {
      cardsChosen: true,
      numberToDiscard: 1,
    });

    expect(() => getExpectedRoutEvent(routState)).toThrow(
      'Rout state has cards chosen but not marked as completed',
    );
  });
});
