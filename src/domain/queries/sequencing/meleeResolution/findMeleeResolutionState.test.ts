import { createEmptyGameState } from '@factories';
import {
  createMeleeResolutionState,
  createResolveMeleePhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { findMeleeResolutionState } from './findMeleeResolutionState';

describe('findMeleeResolutionState function', () => {
  it('returns the melee being fought', () => {
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty);
    const state = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(findMeleeResolutionState(state)).toBe(melee);
  });

  it('answers undefined between one melee and the next', () => {
    // The order of the melees is chosen between them (§4.4.2).
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(
      empty,
      createResolveMeleePhaseState(empty, {
        currentMeleeResolutionState: 'pending',
      }),
    );

    expect(findMeleeResolutionState(state)).toBeUndefined();
  });

  it('answers undefined outside Phase 4', () => {
    expect(
      findMeleeResolutionState(createEmptyGameState('standard')),
    ).toBeUndefined();
  });
});
