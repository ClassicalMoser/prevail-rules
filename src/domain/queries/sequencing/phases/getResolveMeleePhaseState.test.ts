import { createEmptyGameState } from '@factories';
import {
  createCleanupPhaseState,
  createResolveMeleePhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getResolveMeleePhaseState } from './getResolveMeleePhaseState';

describe('getResolveMeleePhaseState function', () => {
  it('returns the resolve-melee slice', () => {
    // `'complete'` is past the opening melee step, so this is the value the test wrote.
    const empty = createEmptyGameState('standard');
    const phase = createResolveMeleePhaseState(empty, { step: 'complete' });
    const state = updatePhaseState(empty, phase);

    expect(getResolveMeleePhaseState(state)).toBe(phase);
  });

  it('throws when the phase is cleanup', () => {
    const phase = createCleanupPhaseState();
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(() => getResolveMeleePhaseState(state)).toThrow(
      'Expected resolveMelee phase, got cleanup',
    );
  });
});
