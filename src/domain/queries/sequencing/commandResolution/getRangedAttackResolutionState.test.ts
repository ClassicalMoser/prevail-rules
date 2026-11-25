import { createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getRangedAttackResolutionState } from './getRangedAttackResolutionState';

/** A caller that knows a Shoot order is under way reads it here. */
describe('getRangedAttackResolutionState function', () => {
  it('returns the shot being taken', () => {
    // Phase 3, with a Shoot order under way.
    const empty = createEmptyGameState('standard');
    const resolution = createRangedAttackResolutionState(empty);
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    });
    const state = updatePhaseState(empty, phase);

    // The shot this test opened.
    expect(getRangedAttackResolutionState(state)).toBe(resolution);
  });

  it('throws when the order under way is a move', () => {
    // Phase 3, with a Move order under way instead.
    const empty = createEmptyGameState('standard');
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: createMovementResolutionState(empty),
    });
    const state = updatePhaseState(empty, phase);

    // Asking for a shot during a move is out of turn.
    expect(() => getRangedAttackResolutionState(state)).toThrow(
      'Current command resolution is not a ranged attack',
    );
  });
});
