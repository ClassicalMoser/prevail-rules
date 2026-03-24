import { createRoutState, createTestUnit } from '@testing';
import { describe, expect, it } from 'vitest';
import { getExpectedRoutEvent } from './getExpectedRoutEvent';

/**
 * getExpectedRoutEvent: next rout sub-step as a game effect or player choice from rout-resolution state.
 */
describe('getExpectedRoutEvent', () => {
  it('given the rout has not been resolved yet, requests rout resolution', () => {
    const routState = createRoutState('black', createTestUnit('white'));

    expect(getExpectedRoutEvent(routState)).toEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRout',
    });
  });

  it('given cards have not been chosen, asks the routed player to choose discard', () => {
    const routState = createRoutState('white', createTestUnit('black'), {
      numberToDiscard: 2,
      cardsChosen: false,
    });

    expect(getExpectedRoutEvent(routState)).toEqual({
      actionType: 'playerChoice',
      playerSource: 'white',
      choiceType: 'chooseRoutDiscard',
    });
  });

  it('given when the rout is already complete, throws', () => {
    const routState = createRoutState('black', createTestUnit('white'), {
      completed: true,
      numberToDiscard: 1,
      cardsChosen: true,
    });

    expect(() => getExpectedRoutEvent(routState)).toThrow(
      'Rout state is already complete',
    );
  });

  it('given when cards are chosen but the rout is not marked complete, throws', () => {
    const routState = createRoutState('black', createTestUnit('white'), {
      numberToDiscard: 1,
      cardsChosen: true,
    });

    expect(() => getExpectedRoutEvent(routState)).toThrow(
      'Rout state has cards chosen but not marked as completed',
    );
  });
});
