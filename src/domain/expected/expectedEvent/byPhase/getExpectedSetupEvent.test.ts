import { createGameState, createTestUnit, withReservedUnits } from '@testing';
import { updateCurrentInitiative } from '@transforms';

import { getExpectedSetupEvent } from './getExpectedSetupEvent';

import { createEmptyGameState } from '@factories';

/**
 * Round 0 is setup: each side places its whole army, the side with the
 * initiative first, and once both have the round ends.
 */
describe('getExpectedSetupEvent function', () => {
  it('asks the side with the initiative to set up first', () => {
    // White holds the initiative, and both armies wait in reserve.
    const state = withReservedUnits(
      updateCurrentInitiative(createEmptyGameState('standard'), 'white'),
      [createTestUnit('black'), createTestUnit('white')],
    );

    // White places its army first.
    expect(getExpectedSetupEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'white',
    });
  });

  it('follows the initiative, whichever side holds it', () => {
    // Black holds the initiative, and both armies wait in reserve.
    const state = withReservedUnits(
      updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
      [createTestUnit('white'), createTestUnit('black')],
    );

    // Black places its army first.
    expect(getExpectedSetupEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'black',
    });
  });

  it('asks the other side once the first has placed its army', () => {
    // White holds the initiative and has placed its army; Black's still waits.
    const state = withReservedUnits(
      createGameState([['K-9', 'white', 'north']], {
        currentInitiative: 'white',
      }),
      [createTestUnit('black')],
    );

    // Black places its army next.
    expect(getExpectedSetupEvent(state)).toStrictEqual({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
      playerSource: 'black',
    });
  });

  it('ends round 0 once both sides have placed their armies', () => {
    // Both armies stand on the board, and nothing waits in reserve.
    const state = createGameState([
      ['K-9', 'white', 'north'],
      ['B-9', 'black', 'south'],
    ]);

    // The end of round 0 is the effect that begins round 1.
    expect(getExpectedSetupEvent(state)).toStrictEqual({
      actionType: 'gameEffect',
      effectType: 'roundEnd',
    });
  });
});
