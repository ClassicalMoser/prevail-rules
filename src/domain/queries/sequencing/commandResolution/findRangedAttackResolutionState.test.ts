import { createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { findRangedAttackResolutionState } from './findRangedAttackResolutionState';

describe('findRangedAttackResolutionState function', () => {
  it('returns the shot being taken', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createRangedAttackResolutionState(empty);
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: resolution,
      }),
    );

    expect(findRangedAttackResolutionState(state)).toBe(resolution);
  });

  it('answers undefined when the order in progress is a move', () => {
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: createMovementResolutionState(empty),
      }),
    );

    expect(findRangedAttackResolutionState(state)).toBeUndefined();
  });

  it('answers undefined when no order is under way', () => {
    expect(
      findRangedAttackResolutionState(createEmptyGameState('standard')),
    ).toBeUndefined();
  });
});
