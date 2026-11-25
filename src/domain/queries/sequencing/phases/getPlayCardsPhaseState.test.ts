import { createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createPlayCardsPhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getPlayCardsPhaseState } from './getPlayCardsPhaseState';

/** Phase 1, where both players choose a card and initiative is settled (§4.1). */
describe('getPlayCardsPhaseState function', () => {
  it('returns the play cards phase', () => {
    // Assigning initiative is a later step than the factory's opening step.
    const phase = createPlayCardsPhaseState({ step: 'assignInitiative' });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    // The phase this test installed.
    expect(getPlayCardsPhaseState(state)).toBe(phase);
  });

  it('throws when the phase is issue commands', () => {
    // The round has moved on to Phase 3.
    const empty = createEmptyGameState('standard');
    const phase = createIssueCommandsPhaseState(empty);
    const state = updatePhaseState(empty, phase);

    // Asking for cards here is out of turn; the message names the phase found.
    expect(() => getPlayCardsPhaseState(state)).toThrow(
      'Expected playCards phase, got issueCommands',
    );
  });
});
