import { createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createResolveMeleePhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getIssueCommandsPhaseState } from './getIssueCommandsPhaseState';

describe('getIssueCommandsPhaseState function', () => {
  it('returns the issue-commands slice', () => {
    // The second player's step, so the assertion is not the factory's first step.
    const empty = createEmptyGameState('standard');
    const phase = createIssueCommandsPhaseState(empty, {
      step: 'secondPlayerIssueCommands',
    });
    const state = updatePhaseState(empty, phase);

    expect(getIssueCommandsPhaseState(state)).toBe(phase);
  });

  it('throws when the phase is resolve melee', () => {
    const empty = createEmptyGameState('standard');
    const phase = createResolveMeleePhaseState(empty);
    const state = updatePhaseState(empty, phase);

    expect(() => getIssueCommandsPhaseState(state)).toThrow(
      'Expected issueCommands phase, got resolveMelee',
    );
  });
});
