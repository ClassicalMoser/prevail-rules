import { createEmptyGameState } from '@factories';
import { createMoveCommandersPhaseState } from '@testing';

import { updatePhaseState } from './updatePhaseState';

/**
 * The phase the round is in is replaced; the rest of the round stays.
 */
describe('updatePhaseState function', () => {
  it('puts the round in the given phase, leaving the state it was given as it was', () => {
    // A new game, in no phase yet; Move Commanders begins (§4.2).
    const state = createEmptyGameState('standard');
    const moveCommanders = createMoveCommandersPhaseState();

    const updated = updatePhaseState(state, moveCommanders);

    // The round is in Move Commanders, first commander to move; the state
    // given is still in no phase.
    expect(updated.currentRoundState.currentPhaseState).toStrictEqual({
      phase: 'moveCommanders',
      step: 'moveFirstCommander',
    });
    expect(state.currentRoundState.currentPhaseState).toBe('none');
  });
});
