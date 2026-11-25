import { createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { findMeleeResolutionState } from './findMeleeResolutionState';

/** Melees are fought one space at a time in Phase 4 (§4.4.2). */
describe('findMeleeResolutionState function', () => {
  it('returns the melee being fought', () => {
    // Phase 4, with a melee under way.
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty);
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    const state = updatePhaseState(empty, phase);

    // The melee this test opened.
    expect(findMeleeResolutionState(state)).toBe(melee);
  });

  it('answers undefined between one melee and the next', () => {
    // The order of the melees is chosen between them (§4.4.2).
    const empty = createEmptyGameState('standard');
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: 'pending',
    });
    const state = updatePhaseState(empty, phase);

    // No melee is under way, and that is an ordinary answer.
    expect(findMeleeResolutionState(state)).toBeUndefined();
  });

  it('answers undefined in Phase 3, before any melee is fought', () => {
    // Orders are still being carried out.
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(empty, createIssueCommandsPhaseState(empty));

    // No melee is under way.
    expect(findMeleeResolutionState(state)).toBeUndefined();
  });

  it('answers undefined before the round has entered a phase', () => {
    // No round is under way, so no melee can be.
    const state = createEmptyGameState('standard');

    // No melee is under way.
    expect(findMeleeResolutionState(state)).toBeUndefined();
  });
});
