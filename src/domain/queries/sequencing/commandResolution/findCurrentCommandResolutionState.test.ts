import { createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createResolveMeleePhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { findCurrentCommandResolutionState } from './findCurrentCommandResolutionState';

/** Orders are carried out in Phase 3 only, one unit at a time (§4.3.9). */
describe('findCurrentCommandResolutionState function', () => {
  it('returns the order being carried out', () => {
    // Phase 3, with a Move order under way.
    const empty = createEmptyGameState('standard');
    const resolution = createMovementResolutionState(empty);
    const phase = createIssueCommandsPhaseState({
      currentCommandResolutionState: resolution,
    });
    const state = updatePhaseState(empty, phase);

    // The order this test opened.
    expect(findCurrentCommandResolutionState(state)).toBe(resolution);
  });

  it('answers undefined before any unit of the order has been named', () => {
    // Phase 3, between orders: no unit has been chosen to act yet.
    const empty = createEmptyGameState('standard');
    const phase = createIssueCommandsPhaseState({
      currentCommandResolutionState: 'pending',
    });
    const state = updatePhaseState(empty, phase);

    // Nothing is being carried out, and that is an ordinary answer.
    expect(findCurrentCommandResolutionState(state)).toBeUndefined();
  });

  it('answers undefined in Phase 4, where no orders are carried out', () => {
    // A melee is being fought; orders belong to the phase before.
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(empty, createResolveMeleePhaseState(empty));

    // No order is under way.
    expect(findCurrentCommandResolutionState(state)).toBeUndefined();
  });

  it('answers undefined before the round has entered a phase', () => {
    // No round is under way, so no order can be.
    const state = createEmptyGameState('standard');

    // No order is under way.
    expect(findCurrentCommandResolutionState(state)).toBeUndefined();
  });
});
