import { createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createResolveMeleePhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getCurrentCommandResolutionState } from './getCurrentCommandResolutionState';

/** A caller that knows an order is under way in Phase 3 reads it here. */
describe('getCurrentCommandResolutionState function', () => {
  it('returns the order being carried out', () => {
    // Phase 3, with a Move order under way.
    const empty = createEmptyGameState('standard');
    const resolution = createMovementResolutionState(empty);
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    });
    const state = updatePhaseState(empty, phase);

    // The order this test opened.
    expect(getCurrentCommandResolutionState(state)).toBe(resolution);
  });

  it('throws in Phase 4, where no orders are carried out', () => {
    // A melee is being fought; orders belong to the phase before.
    const empty = createEmptyGameState('standard');
    const state = updatePhaseState(empty, createResolveMeleePhaseState(empty));

    // Asking for an order here is out of turn.
    expect(() => getCurrentCommandResolutionState(state)).toThrow(
      'Not in issueCommands phase',
    );
  });

  it('throws between orders, before any unit has been named', () => {
    // Phase 3, with no order opened yet.
    const empty = createEmptyGameState('standard');
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: 'pending',
    });
    const state = updatePhaseState(empty, phase);

    // There is no order to insist on.
    expect(() => getCurrentCommandResolutionState(state)).toThrow(
      'No current command resolution state',
    );
  });
});
