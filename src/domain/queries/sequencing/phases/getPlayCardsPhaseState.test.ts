import { createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createPlayCardsPhaseState,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getPlayCardsPhaseState } from './getPlayCardsPhaseState';

describe('getPlayCardsPhaseState function', () => {
  it('returns the play-cards slice', () => {
    // Tag and step are both play-cards, so the narrow getter can return the slice.
    const phase = createPlayCardsPhaseState({ step: 'revealCards' });
    const state = updatePhaseState(createEmptyGameState('standard'), phase);

    expect(getPlayCardsPhaseState(state)).toBe(phase);
  });

  it('throws when the phase is issue commands', () => {
    // A real phase, with the wrong tag. The error names the tag it found.
    const empty = createEmptyGameState('standard');
    const phase = createIssueCommandsPhaseState(empty);
    const state = updatePhaseState(empty, phase);

    expect(() => getPlayCardsPhaseState(state)).toThrow(
      'Expected playCards phase, got issueCommands',
    );
  });
});
