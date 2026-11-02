import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState, createPlayCardsPhaseState } from '@testing';
import { updatePhaseState } from '@transforms';

import { getCleanupPhaseState } from './getCleanupPhaseState';

describe('getCleanupPhaseState function', () => {
  it('returns the cleanup slice', () => {
    // Choose-rally is a later cleanup step than the factory's opening step.
    const phase = createCleanupPhaseState({ step: 'firstPlayerChooseRally' });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(getCleanupPhaseState(state)).toBe(phase);
  });

  it('throws when the phase is play cards', () => {
    const phase = createPlayCardsPhaseState();
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(() => getCleanupPhaseState(state)).toThrow(
      'Expected cleanup phase, got playCards',
    );
  });
});
