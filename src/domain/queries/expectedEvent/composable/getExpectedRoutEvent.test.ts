import { createRoutState, createTestUnit } from '@testing';
import { describe, expect, it } from 'vitest';
import { getExpectedRoutEvent } from './getExpectedRoutEvent';

describe('getExpectedRoutEvent', () => {
  it('should request rout resolution when the rout has not been resolved yet', () => {
    const routState = createRoutState('black', createTestUnit('white'));

    expect(getExpectedRoutEvent(routState)).toEqual({
      actionType: 'gameEffect',
      effectType: 'resolveRout',
    });
  });

  it('should ask the routed player to choose discard when cards have not been chosen', () => {
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

  it('should throw when the rout is already complete', () => {
    const routState = createRoutState('black', createTestUnit('white'), {
      completed: true,
      numberToDiscard: 1,
      cardsChosen: true,
    });

    expect(() => getExpectedRoutEvent(routState)).toThrow(
      'Rout state is already complete',
    );
  });

  it('should throw when cards are chosen but the rout is not marked complete', () => {
    const routState = createRoutState('black', createTestUnit('white'), {
      numberToDiscard: 1,
      cardsChosen: true,
    });

    expect(() => getExpectedRoutEvent(routState)).toThrow(
      'Rout state has cards chosen but not marked as completed',
    );
  });
});
