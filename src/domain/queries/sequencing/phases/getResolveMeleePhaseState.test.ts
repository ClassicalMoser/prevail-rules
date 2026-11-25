import { createEmptyGameState } from '@factories';
import {
  createCleanupPhaseState,
  createResolveMeleePhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getResolveMeleePhaseState } from './getResolveMeleePhaseState';

/** Phase 4, where every engaged space fights (§4.4). */
describe('getResolveMeleePhaseState function', () => {
  it('returns the resolve melee phase', () => {
    // `'complete'` is past the opening melee step, so this is the value the test wrote.
    const empty = createEmptyGameState('standard');
    const phase = createResolveMeleePhaseState(empty, { step: 'complete' });
    const state = updatePhaseState(empty, phase);

    // The phase this test installed.
    expect(getResolveMeleePhaseState(state)).toBe(phase);
  });

  it('throws when the phase is cleanup', () => {
    // The round has moved on to Phase 5.
    const phase = createCleanupPhaseState();
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    // Asking for melee here is out of turn; the message names the phase found.
    expect(() => getResolveMeleePhaseState(state)).toThrow(
      'Expected resolveMelee phase, got cleanup',
    );
  });
});
