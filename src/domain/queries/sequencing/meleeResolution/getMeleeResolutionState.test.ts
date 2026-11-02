import { createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getMeleeResolutionState } from './getMeleeResolutionState';

describe('getMeleeResolutionState function', () => {
  it('returns the melee slice on the phase', () => {
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, { location: 'D-4' });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    expect(getMeleeResolutionState(state)).toBe(melee);
  });

  it('throws when the phase is issue commands', () => {
    const empty = createEmptyGameState('standard');
    const phase = createIssueCommandsPhaseState(empty);
    const state = updatePhaseState(empty, phase);

    expect(() => getMeleeResolutionState(state)).toThrow(
      'Not in resolveMelee phase',
    );
  });

  it('throws when the round has no phase', () => {
    const state = createEmptyGameState('standard');

    expect(() => getMeleeResolutionState(state)).toThrow(
      'Not in resolveMelee phase',
    );
  });

  it('throws when melee resolution is still pending', () => {
    const empty = createEmptyGameState('standard');
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: 'pending',
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getMeleeResolutionState(state)).toThrow(
      'No current melee resolution state',
    );
  });
});
