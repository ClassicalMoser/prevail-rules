import type { CleanupPhaseStep, GameState } from '@game';
import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState } from '@testing';
import { updatePhaseState } from '@transforms';

import { getNextStepForChooseRally } from './getNextStepForChooseRally';

/** Cleanup on this step. */
function cleanupOn(step: CleanupPhaseStep): GameState {
  const state = updatePhaseState(
    createEmptyGameState('standard'),
    createCleanupPhaseState({ step }),
  );
  return state;
}

/**
 * Each player in turn chooses whether to rally, and a player who does
 * resolves it before the next one chooses (§10.3).
 */
describe('getNextStepForChooseRally function', () => {
  it('moves a first player who rallies to resolving it, and one who declines to the second player’s choice', () => {
    const state = cleanupOn('firstPlayerChooseRally');

    expect(getNextStepForChooseRally(state, true)).toBe(
      'firstPlayerResolveRally',
    );
    expect(getNextStepForChooseRally(state, false)).toBe(
      'secondPlayerChooseRally',
    );
  });

  it('moves a second player who rallies to resolving it, and one who declines to the end of the round', () => {
    const state = cleanupOn('secondPlayerChooseRally');

    expect(getNextStepForChooseRally(state, true)).toBe(
      'secondPlayerResolveRally',
    );
    expect(getNextStepForChooseRally(state, false)).toBe('complete');
  });

  it('throws off the choose-rally steps, where nobody chooses', () => {
    expect(() =>
      getNextStepForChooseRally(cleanupOn('complete'), true),
    ).toThrow('Cleanup phase is not on a chooseRally step: complete');
  });
});
