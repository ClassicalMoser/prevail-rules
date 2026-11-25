import { createEmptyGameState } from '@factories';
import { createPlayCardsPhaseState } from '@testing';
import { updatePhaseState } from '@transforms';

import { getCurrentStep } from './getCurrentStep';

/** Where play stands within the phase the round is in. */
describe('getCurrentStep function', () => {
  it('returns the step of the current phase', () => {
    // Phase 1, on the step where initiative is assigned (§4.1.3).
    const phase = createPlayCardsPhaseState({ step: 'assignInitiative' });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    // The step this test wrote.
    expect(getCurrentStep(state)).toBe('assignInitiative');
  });

  it('throws when the round has no phase', () => {
    // An empty game is still on `'none'`, before the round's first phase.
    const state = createEmptyGameState('standard');

    // With no phase there is no step to read.
    expect(() => getCurrentStep(state)).toThrow('No current phase state found');
  });
});
