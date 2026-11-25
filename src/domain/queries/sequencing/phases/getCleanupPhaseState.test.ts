import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState, createPlayCardsPhaseState } from '@testing';
import { updatePhaseState } from '@transforms';

import { getCleanupPhaseState } from './getCleanupPhaseState';

/** Phase 5, where cards leave play and each player may rally (§4.5). */
describe('getCleanupPhaseState function', () => {
  it('returns the cleanup phase', () => {
    // Choose-rally is a later cleanup step than the factory's opening step.
    const phase = createCleanupPhaseState({ step: 'firstPlayerChooseRally' });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    // The phase this test installed.
    expect(getCleanupPhaseState(state)).toBe(phase);
  });

  it('throws when the phase is play cards', () => {
    // The round is still in Phase 1.
    const phase = createPlayCardsPhaseState();
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    // Asking for cleanup here is out of turn; the message names the phase found.
    expect(() => getCleanupPhaseState(state)).toThrow(
      'Expected cleanup phase, got playCards',
    );
  });
});
