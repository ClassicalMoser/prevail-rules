import { createEmptyGameState } from '@factories';
import { getPlayCardsPhaseState } from '@queries';
import { createCleanupPhaseState, createPlayCardsPhaseState } from '@testing';

import { updatePhaseState } from '../state/updatePhaseState';
import { updatePlayCardsStep } from './updatePlayCardsStep';

/**
 * Phase 1 runs in steps: both players choose a card face down and the two
 * are turned over together, then the lower one takes initiative (§4.1).
 */
describe('updatePlayCardsStep function', () => {
  it('moves Phase 1 on from choosing cards to assigning initiative', () => {
    // Both players are choosing their cards.
    const choosing = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'chooseCards' }),
    );

    const assigning = getPlayCardsPhaseState(
      updatePlayCardsStep(choosing, 'assignInitiative'),
    );

    // Once both cards are revealed, initiative is decided next.
    expect(assigning.step).toBe('assignInitiative');
  });

  it('throws outside Phase 1, where no cards are being played', () => {
    // The round has reached cleanup.
    const inCleanup = updatePhaseState(
      createEmptyGameState('standard'),
      createCleanupPhaseState(),
    );

    expect(() => updatePlayCardsStep(inCleanup, 'assignInitiative')).toThrow(
      'Expected playCards phase, got cleanup',
    );
  });
});
