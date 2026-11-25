import { createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { findRangedAttackResolutionState } from './findRangedAttackResolutionState';

/** A Shoot order is one of the two kinds of order a card gives (§4.3.1). */
describe('findRangedAttackResolutionState function', () => {
  it('returns the shot being taken', () => {
    // Phase 3, with a Shoot order under way.
    const empty = createEmptyGameState('standard');
    const resolution = createRangedAttackResolutionState(empty);
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    });
    const state = updatePhaseState(empty, phase);

    // The shot this test opened.
    expect(findRangedAttackResolutionState(state)).toBe(resolution);
  });

  it('answers undefined when the order in progress is a move', () => {
    // Phase 3, with a Move order under way instead.
    const empty = createEmptyGameState('standard');
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: createMovementResolutionState(empty),
    });
    const state = updatePhaseState(empty, phase);

    // No unit is shooting.
    expect(findRangedAttackResolutionState(state)).toBeUndefined();
  });

  it('answers undefined when no order is under way', () => {
    // Before the round has a phase, no order can be under way.
    const state = createEmptyGameState('standard');

    // No unit is shooting.
    expect(findRangedAttackResolutionState(state)).toBeUndefined();
  });
});
