import { createEmptyGameState } from '@factories';
import { getCleanupPhaseState } from '@queries';
import { createCleanupPhaseState, createRallyResolutionState } from '@testing';

import { updatePhaseState } from '../state/updatePhaseState';
import { updateCleanupStep } from './updateCleanupStep';

/**
 * Cleanup runs in a fixed order: cards leave play, then the first player
 * chooses whether to rally and carries it out, then the second (§4.5).
 */
describe('updateCleanupStep function', () => {
  it('moves cleanup to the step given and leaves the rallies as they were', () => {
    // The first player has declined to rally, and that rally is done.
    const declined = createRallyResolutionState({
      completed: true,
      playerRallied: false,
    });
    const before = updatePhaseState(
      createEmptyGameState('standard'),
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: declined,
        step: 'firstPlayerChooseRally',
      }),
    );

    const after = getCleanupPhaseState(
      updateCleanupStep(before, 'secondPlayerChooseRally'),
    );

    // The second player chooses next, and the first player's rally stands.
    expect(after.step).toBe('secondPlayerChooseRally');
    expect(after.firstPlayerRallyResolutionState).toBe(declined);
  });

  it('throws outside cleanup', () => {
    // Round 0 is setup, which has no phase at all.
    expect(() =>
      updateCleanupStep(createEmptyGameState('standard'), 'complete'),
    ).toThrow('No current phase state found');
  });
});
