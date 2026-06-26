import { MOVE_COMMANDERS_PHASE, PLAY_CARDS_PHASE } from '@game';
import { createEmptyGameState } from '@testing';

import { updatePhaseState } from './updatePhaseState';

/**
 * UpdatePhaseState: Creates a new game state with the phase state updated.
 */
describe(updatePhaseState, () => {
  it('given update the phase state', () => {
    const state = createEmptyGameState();
    const newPhaseState = {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    } as const;

    const newState = updatePhaseState(state, newPhaseState);

    expect(newState.currentRoundState.currentPhaseState).toStrictEqual(
      newPhaseState,
    );
  });

  it('given not mutate the original state', () => {
    const state = createEmptyGameState();
    const originalPhaseState = state.currentRoundState.currentPhaseState;
    const newPhaseState = {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'moveFirstCommander',
    } as const;

    updatePhaseState(state, newPhaseState);

    expect(state.currentRoundState.currentPhaseState).toBe(originalPhaseState);
  });

  it('given update to different phase and step', () => {
    const state = createEmptyGameState();
    const newPhaseState = {
      phase: MOVE_COMMANDERS_PHASE,
      step: 'complete',
    } as const;

    const newState = updatePhaseState(state, newPhaseState);

    const phaseState = newState.currentRoundState.currentPhaseState;
    expect(phaseState !== 'none' && phaseState.phase).toBe(
      MOVE_COMMANDERS_PHASE,
    );
    expect(phaseState !== 'none' && phaseState.step).toBe('complete');
  });
});
