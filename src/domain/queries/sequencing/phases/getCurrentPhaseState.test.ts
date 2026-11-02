import { createEmptyGameState } from '@factories';
import { createPlayCardsPhaseState } from '@testing';
import { updatePhaseState } from '@transforms';

import { getCurrentPhaseState } from './getCurrentPhaseState';

describe('getCurrentPhaseState function', () => {
  it('returns the phase slice on the round', () => {
    // The slice this test installed. The getter returns that same object.
    const phase = createPlayCardsPhaseState({ step: 'revealCards' });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(getCurrentPhaseState(state)).toBe(phase);
  });

  it('throws when the round has no phase', () => {
    // An empty game is still on `'none'`, so there is no phase slice to read.
    const state = createEmptyGameState('standard');

    expect(() => getCurrentPhaseState(state)).toThrow(
      'No current phase state found',
    );
  });
});
