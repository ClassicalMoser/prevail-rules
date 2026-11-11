import { createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { findMovementResolutionState } from './findMovementResolutionState';

describe('findMovementResolutionState function', () => {
  it('returns the movement being carried out', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createMovementResolutionState(empty);
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: resolution,
      }),
    );

    expect(findMovementResolutionState(state)).toBe(resolution);
  });

  it('answers undefined when the order in progress is a shot', () => {
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: createRangedAttackResolutionState(empty),
      }),
    );

    expect(findMovementResolutionState(state)).toBeUndefined();
  });

  it('answers undefined when no order is under way', () => {
    expect(
      findMovementResolutionState(createEmptyGameState('standard')),
    ).toBeUndefined();
  });
});
