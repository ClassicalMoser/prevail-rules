import { createEmptyGameState, createTestUnit } from '@testing';

import { getExpectedSetupUnitsEvent } from './getExpectedSetupUnitsEvent';

/**
 * GetExpectedSetupUnitsEvent: white then black while reserved units remain.
 */
describe(getExpectedSetupUnitsEvent, () => {
  it('given white reserved units, expects white setupUnits', () => {
    const state = {
      ...createEmptyGameState(),
      reservedUnits: [createTestUnit('white')],
    };

    expect(getExpectedSetupUnitsEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'white',
    });
  });

  it('given only black reserved units, expects black setupUnits', () => {
    const state = {
      ...createEmptyGameState(),
      reservedUnits: [createTestUnit('black')],
    };

    expect(getExpectedSetupUnitsEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'black',
    });
  });

  it('given both sides reserved, prefers white first', () => {
    const state = {
      ...createEmptyGameState(),
      reservedUnits: [createTestUnit('black'), createTestUnit('white')],
    };

    expect(getExpectedSetupUnitsEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'white',
    });
  });

  it('given empty reserve, throws', () => {
    expect(() => getExpectedSetupUnitsEvent(createEmptyGameState())).toThrow(
      'No reserved units remaining for setup',
    );
  });
});
