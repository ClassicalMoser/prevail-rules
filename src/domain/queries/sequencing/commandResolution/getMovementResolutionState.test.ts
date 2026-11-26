import { createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getMovementResolutionState } from './getMovementResolutionState';

/** A caller that knows a Move order is under way reads it here. */
describe('getMovementResolutionState function', () => {
  it('returns the movement being carried out', () => {
    // Phase 3, with a Move order under way.
    const empty = createEmptyGameState('standard');
    const resolution = createMovementResolutionState(empty);
    const phase = createIssueCommandsPhaseState({
      currentCommandResolutionState: resolution,
    });
    const state = updatePhaseState(empty, phase);

    // The move this test opened.
    expect(getMovementResolutionState(state)).toBe(resolution);
  });

  it('throws when the order under way is a shot', () => {
    // Phase 3, with a Shoot order under way instead.
    const empty = createEmptyGameState('standard');
    const phase = createIssueCommandsPhaseState({
      currentCommandResolutionState: createRangedAttackResolutionState(empty),
    });
    const state = updatePhaseState(empty, phase);

    // Asking for a move during a shot is out of turn.
    expect(() => getMovementResolutionState(state)).toThrow(
      'Current command resolution is not a movement',
    );
  });
});
