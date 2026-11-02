import { createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createResolveMeleePhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getCurrentCommandResolutionState } from './getCurrentCommandResolutionState';

describe('getCurrentCommandResolutionState function', () => {
  it('returns the command resolution on the issue-commands phase', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createMovementResolutionState(empty);
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    });
    const state = updatePhaseState(empty, phase);

    expect(getCurrentCommandResolutionState(state)).toBe(resolution);
  });

  it('throws when the phase is resolve melee', () => {
    const empty = createEmptyGameState('standard');
    const phase = createResolveMeleePhaseState(empty);
    const state = updatePhaseState(empty, phase);

    expect(() => getCurrentCommandResolutionState(state)).toThrow(
      'Not in issueCommands phase',
    );
  });

  it('throws when command resolution is still pending', () => {
    const empty = createEmptyGameState('standard');
    const phase = createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: 'pending',
    });
    const state = updatePhaseState(empty, phase);

    expect(() => getCurrentCommandResolutionState(state)).toThrow(
      'No current command resolution state',
    );
  });
});
