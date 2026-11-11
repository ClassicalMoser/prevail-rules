import { createEmptyGameState } from '@factories';
import { getCleanupPhaseState } from '@queries';
import { createCleanupPhaseState, createRallyResolutionState } from '@testing';

import { updateCurrentInitiative } from '../state/updateCurrentInitiative';
import { updatePhaseState } from '../state/updatePhaseState';
import { updateRallyResolutionState } from './updateRallyResolutionState';

/**
 * Each player has one rally a cleanup, and the player with initiative rallies
 * first (§10.3): the slots are named for that order.
 */
describe('updateRallyResolutionState function', () => {
  const inCleanup = updatePhaseState(
    updateCurrentInitiative(createEmptyGameState('standard'), 'black'),
    createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
  );

  it('writes the initiative player’s rally into the first slot', () => {
    const rally = createRallyResolutionState({ playerRallied: true });

    const written = getCleanupPhaseState(
      updateRallyResolutionState(inCleanup, 'black', rally),
    );

    expect(written.firstPlayerRallyResolutionState).toBe(rally);
    expect(written.secondPlayerRallyResolutionState).toBe('pending');
  });

  it('writes the other player’s rally into the second slot', () => {
    const rally = createRallyResolutionState({ playerRallied: false });

    const written = getCleanupPhaseState(
      updateRallyResolutionState(inCleanup, 'white', rally),
    );

    expect(written.secondPlayerRallyResolutionState).toBe(rally);
    expect(written.firstPlayerRallyResolutionState).toBe('pending');
  });
});
