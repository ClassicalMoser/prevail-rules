import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState } from '@testing';
import { updatePhaseState } from '@transforms';

import { getNextStepForChooseRally } from './getNextStepForChooseRally';

/**
 * Each player in turn chooses whether to rally, and a player who does
 * resolves it before the next one chooses (§10.3).
 */
describe('getNextStepForChooseRally function', () => {
  // The steps are named first and second, so who holds the initiative does
  // not change the answer.
  const empty = createEmptyGameState('standard');

  it('moves a first player who rallies to resolving it, and one who declines to the second player’s choice', () => {
    // The first player is choosing.
    const state = updatePhaseState(
      empty,
      createCleanupPhaseState({ step: 'firstPlayerChooseRally' }),
    );

    // Rallying leads to resolving it; declining passes the choice on.
    expect(getNextStepForChooseRally(state, true)).toBe(
      'firstPlayerResolveRally',
    );
    expect(getNextStepForChooseRally(state, false)).toBe(
      'secondPlayerChooseRally',
    );
  });

  it('moves a second player who rallies to resolving it, and one who declines to the end of the round', () => {
    // The second player is choosing.
    const state = updatePhaseState(
      empty,
      createCleanupPhaseState({ step: 'secondPlayerChooseRally' }),
    );

    // Rallying leads to resolving it; declining ends the round (§4.5.4).
    expect(getNextStepForChooseRally(state, true)).toBe(
      'secondPlayerResolveRally',
    );
    expect(getNextStepForChooseRally(state, false)).toBe('complete');
  });

  it('throws off the choose-rally steps, where nobody chooses', () => {
    // Both rallies are behind; the round is over.
    const state = updatePhaseState(
      empty,
      createCleanupPhaseState({ step: 'complete' }),
    );

    // No choice is being made, so there is no step to follow it.
    expect(() => getNextStepForChooseRally(state, true)).toThrow(
      'Cleanup phase is not on a chooseRally step: complete',
    );
  });
});
