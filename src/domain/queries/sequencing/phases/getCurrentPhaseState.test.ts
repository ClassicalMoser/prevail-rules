import { createEmptyGameState } from '@factories';
import { createPlayCardsPhaseState } from '@testing';
import { updatePhaseState } from '@transforms';

import { getCurrentPhaseState } from './getCurrentPhaseState';

/** A round passes through its five phases in order (§4). */
describe('getCurrentPhaseState function', () => {
  it('returns the phase the round is in', () => {
    // The phase this test installed. The getter returns that same object.
    const phase = createPlayCardsPhaseState({ step: 'assignInitiative' });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    // Phase 1, as installed.
    expect(getCurrentPhaseState(state)).toBe(phase);
  });

  it('throws when the round has no phase', () => {
    // An empty game is still on `'none'`, so there is no phase slice to read.
    const state = createEmptyGameState('standard');

    // Before the round begins there is nothing to insist on.
    expect(() => getCurrentPhaseState(state)).toThrow(
      'No current phase state found',
    );
  });
});
