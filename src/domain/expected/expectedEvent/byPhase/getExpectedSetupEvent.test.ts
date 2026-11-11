import { createTestUnit } from '@testing';

import { getExpectedSetupEvent } from './getExpectedSetupEvent';

import { createEmptyGameState } from '@factories';
/**
 * GetExpectedSetupEvent: white then black while reserved units remain.
 */
describe('getExpectedSetupEvent function', () => {
  it('given white reserved units, expects white setupUnits', () => {
    const state = {
      ...createEmptyGameState('standard'),
      reservedUnits: [createTestUnit('white')],
    };

    expect(getExpectedSetupEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'white',
    });
  });

  it('given only black reserved units, expects black setupUnits', () => {
    const state = {
      ...createEmptyGameState('standard'),
      reservedUnits: [createTestUnit('black')],
    };

    expect(getExpectedSetupEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'black',
    });
  });

  it('given both sides reserved, prefers white first', () => {
    const state = {
      ...createEmptyGameState('standard'),
      reservedUnits: [createTestUnit('black'), createTestUnit('white')],
    };

    expect(getExpectedSetupEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'white',
    });
  });

  it('given empty reserve, throws', () => {
    expect(() =>
      getExpectedSetupEvent(createEmptyGameState('standard')),
    ).toThrow('No reserved units remaining for setup');
  });
});
