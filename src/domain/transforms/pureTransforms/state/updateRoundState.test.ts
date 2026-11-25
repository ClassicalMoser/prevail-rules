import { createEmptyGameState } from '@factories';

import { updateRoundState } from './updateRoundState';

/**
 * The whole round is replaced at once, as when one round ends and the next
 * begins.
 */
describe('updateRoundState function', () => {
  it('puts the given round in place, leaving the state it was given as it was', () => {
    // Setup is round 0; round 1 begins.
    const state = createEmptyGameState('standard');
    const roundOne = {
      ...state.currentRoundState,
      roundNumber: 1,
    };

    const updated = updateRoundState(state, roundOne);

    // The game is in round 1; the state given is still in setup.
    expect(updated.currentRoundState.roundNumber).toBe(1);
    expect(state.currentRoundState.roundNumber).toBe(0);
  });
});
