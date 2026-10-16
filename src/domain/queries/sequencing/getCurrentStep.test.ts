import { createEmptyGameState } from '@factories';
import { createPlayCardsPhaseState } from '@testing';
import { updatePhaseState } from '@transforms';

import { getCurrentStep } from './getCurrentStep';

/**
 * The step string on the current phase. An empty round has no phase.
 */
describe('getCurrentStep function', () => {
  it('returns the step on the current phase', () => {
    // The step is the value under test. The phase factory only carries it.
    const phase = createPlayCardsPhaseState({ step: 'revealCards' });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(getCurrentStep(state)).toBe('revealCards');
  });

  it('throws when the round has no phase', () => {
    // An empty game is still on `'none'`. The step reader uses the phase reader.
    const state = createEmptyGameState('standard');

    expect(() => getCurrentStep(state)).toThrow('No current phase state found');
  });
});
