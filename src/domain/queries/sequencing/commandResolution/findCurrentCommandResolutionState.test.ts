import { createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { findCurrentCommandResolutionState } from './findCurrentCommandResolutionState';

describe('findCurrentCommandResolutionState function', () => {
  it('returns the order being carried out', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createMovementResolutionState(empty);
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: resolution,
      }),
    );

    expect(findCurrentCommandResolutionState(state)).toBe(resolution);
  });

  it('answers undefined before any unit of the order has been named', () => {
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: 'pending',
      }),
    );

    expect(findCurrentCommandResolutionState(state)).toBeUndefined();
  });

  it('answers undefined outside Phase 3', () => {
    // No round is under way, so no order can be.
    const state = createEmptyGameState('standard');

    expect(findCurrentCommandResolutionState(state)).toBeUndefined();
  });
});
