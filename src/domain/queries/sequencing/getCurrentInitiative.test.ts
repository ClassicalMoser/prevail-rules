import { createEmptyGameState } from '@factories';

import { getCurrentInitiative } from './getCurrentInitiative';

import { updateCurrentInitiative } from '@transforms';

describe(getCurrentInitiative, () => {
  it('returns the value on game state (same as reading currentInitiative)', () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );

    expect(getCurrentInitiative(state)).toBe('white');
    expect(getCurrentInitiative(state)).toBe(state.currentInitiative);
  });

  it('reflects initiative updates on the state object', () => {
    const state = createEmptyGameState('standard');
    state.currentInitiative = 'white';

    expect(getCurrentInitiative(state)).toBe('white');
  });
});
