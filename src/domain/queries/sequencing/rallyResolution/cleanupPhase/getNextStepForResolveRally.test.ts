import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState } from '@testing';
import { updatePhaseState } from '@transforms';

import { getNextStepForResolveRally } from './getNextStepForResolveRally';

/**
 * The first player finishes their rally before the second chooses whether to
 * rally (§10.3.6), and the second player's rally is the last of the round.
 */
describe('getNextStepForResolveRally function', () => {
  // The steps are named first and second, so who holds the initiative does
  // not change the answer.
  const empty = createEmptyGameState('standard');

  it('passes to the second player’s choice after the first player’s rally', () => {
    // The first player is carrying out their rally.
    const state = updatePhaseState(
      empty,
      createCleanupPhaseState({ step: 'firstPlayerResolveRally' }),
    );

    // The second player chooses next.
    expect(getNextStepForResolveRally(state)).toBe('secondPlayerChooseRally');
  });

  it('ends the round after the second player’s rally', () => {
    // The second player is carrying out their rally.
    const state = updatePhaseState(
      empty,
      createCleanupPhaseState({ step: 'secondPlayerResolveRally' }),
    );

    // Nothing follows in this round.
    expect(getNextStepForResolveRally(state)).toBe('complete');
  });

  it('throws on a step that is not a resolve-rally step', () => {
    // §4.5: this round's cards leave play before any rally is resolved,
    // so nothing follows a resolve there.
    const state = updatePhaseState(
      empty,
      createCleanupPhaseState({ step: 'cardsLeavePlay' }),
    );

    // No rally is being resolved; the message names the step.
    expect(() => getNextStepForResolveRally(state)).toThrow(
      'Cleanup is not on a resolve-rally step: cardsLeavePlay',
    );
  });
});
