import { createEmptyGameState } from '@factories';
import { findExpectedEvent } from './findExpectedEvent';

describe('findExpectedEvent function', () => {
  it('returns nothing once a winner is set, because a finished game expects no event', () => {
    // The battle is over: nobody is owed a choice and no effect is due.
    const state = {
      ...createEmptyGameState('standard'),
      winner: 'black' as const,
    };

    expect(findExpectedEvent(state)).toBeUndefined();
  });

  it('returns the next expected event while the game is still being played', () => {
    // Before round one, the first thing owed is the setup of reserved units.
    const state = createEmptyGameState('standard');

    expect(findExpectedEvent(state)).toMatchObject({
      actionType: 'playerChoice',
      choiceType: 'setupUnits',
    });
  });
});
