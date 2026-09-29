import { createEmptyGameState } from '@factories';

import { updateCurrentInitiative } from './updateCurrentInitiative';

/**
 * UpdateCurrentInitiative: Creates a new game state with the current initiative player updated.
 */
describe(updateCurrentInitiative, () => {
  it('updates the initiative player', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const newState = updateCurrentInitiative(state, 'black');
    expect(newState.currentInitiative).toBe('black');
    expect(newState).not.toBe(state);
  });

  it('preserves other top-level fields', () => {
    const state = createEmptyGameState('standard');
    const newState = updateCurrentInitiative(state, 'white');
    expect(newState.currentRoundState).toBe(state.currentRoundState);
    expect(newState.boardState).toBe(state.boardState);
    expect(newState.cardState).toBe(state.cardState);
  });
});
