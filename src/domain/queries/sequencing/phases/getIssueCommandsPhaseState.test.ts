import { createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createResolveMeleePhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getIssueCommandsPhaseState } from './getIssueCommandsPhaseState';

/** Phase 3, where each player issues and carries out their orders (§4.3). */
describe('getIssueCommandsPhaseState function', () => {
  it('returns the issue commands phase', () => {
    // The second player's step, so the assertion is not the factory's first step.
    const empty = createEmptyGameState('standard');
    const phase = createIssueCommandsPhaseState(empty, {
      step: 'secondPlayerIssueCommands',
    });
    const state = updatePhaseState(empty, phase);

    // The phase this test installed.
    expect(getIssueCommandsPhaseState(state)).toBe(phase);
  });

  it('throws when the phase is resolve melee', () => {
    // The round has moved on to Phase 4.
    const empty = createEmptyGameState('standard');
    const phase = createResolveMeleePhaseState(empty);
    const state = updatePhaseState(empty, phase);

    // Asking for orders here is out of turn; the message names the phase found.
    expect(() => getIssueCommandsPhaseState(state)).toThrow(
      'Expected issueCommands phase, got resolveMelee',
    );
  });
});
