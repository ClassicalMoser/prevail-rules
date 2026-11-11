import { createTestUnit } from '@testing';
import { updateCurrentInitiative } from '@transforms';

import { getExpectedSetupEvent } from './getExpectedSetupEvent';

import { createEmptyGameState } from '@factories';

/**
 * Round 0 is setup: each side places its whole army, the side with the
 * initiative first, and once both have the round ends.
 */
describe('getExpectedSetupEvent function', () => {
  it('asks the side with the initiative to set up first', () => {
    const state = {
      ...updateCurrentInitiative(createEmptyGameState('standard'), 'white'),
      reservedUnits: [createTestUnit('black'), createTestUnit('white')],
    };

    expect(getExpectedSetupEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'white',
    });
  });

  it('follows the initiative, whichever side holds it', () => {
    const state = {
      ...updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      reservedUnits: [createTestUnit('white'), createTestUnit('black')],
    };

    expect(getExpectedSetupEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'black',
    });
  });

  it('asks the other side once the first has placed its army', () => {
    const state = {
      ...updateCurrentInitiative(createEmptyGameState('standard'), 'white'),
      reservedUnits: [createTestUnit('black')],
    };

    expect(getExpectedSetupEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'black',
    });
  });

  it('ends round 0 once both sides have placed their armies', () => {
    expect(
      getExpectedSetupEvent(createEmptyGameState('standard')),
    ).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'roundEnd',
    });
  });
});
