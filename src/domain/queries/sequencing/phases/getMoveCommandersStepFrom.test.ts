import { createEmptyGameState } from '@factories';
import { addCommanderToLostCommanders } from '@transforms';

import { getMoveCommandersStepFrom } from './getMoveCommandersStepFrom';

/**
 * In Move Commanders the first player moves, then the second (§4.2.1); a
 * side whose commander has fallen has no turn (§4.2.8).
 */
describe('getMoveCommandersStepFrom function', () => {
  // Black holds initiative, so black is the first player and white second.
  const bothStand = createEmptyGameState('standard');

  it('with both commanders standing, the first player moves first', () => {
    expect(getMoveCommandersStepFrom(bothStand, 'moveFirstCommander')).toBe(
      'moveFirstCommander',
    );
  });

  it('with the first player’s commander fallen, the second player moves first', () => {
    // Black's commander was defeated in an earlier round.
    const state = addCommanderToLostCommanders(bothStand, 'black');

    expect(getMoveCommandersStepFrom(state, 'moveFirstCommander')).toBe(
      'moveSecondCommander',
    );
  });

  it('with the second player’s commander fallen, the phase ends after the first moves', () => {
    // White's commander was defeated.
    const state = addCommanderToLostCommanders(bothStand, 'white');

    // The first player still moves...
    expect(getMoveCommandersStepFrom(state, 'moveFirstCommander')).toBe(
      'moveFirstCommander',
    );
    // ...and the second player's turn passes to the end of the phase.
    expect(getMoveCommandersStepFrom(state, 'moveSecondCommander')).toBe(
      'complete',
    );
  });

  it('with both commanders fallen, the phase has nothing to do', () => {
    const state = addCommanderToLostCommanders(
      addCommanderToLostCommanders(bothStand, 'white'),
      'black',
    );

    expect(getMoveCommandersStepFrom(state, 'moveFirstCommander')).toBe(
      'complete',
    );
  });
});
