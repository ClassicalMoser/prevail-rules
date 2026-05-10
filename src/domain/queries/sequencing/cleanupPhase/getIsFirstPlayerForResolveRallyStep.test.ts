import { CLEANUP_PHASE } from '@game';
import { createEmptyGameState } from '@testing';

import { getIsFirstPlayerForResolveRallyStep } from './getIsFirstPlayerForResolveRallyStep';

/**
 * Cleanup resolve-rally steps alternate first vs second player; this boolean matches the step name.
 */
describe(getIsFirstPlayerForResolveRallyStep, () => {
  it('given firstPlayerResolveRally, returns true', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = {
      firstPlayerRallyResolutionState: undefined,
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: undefined,
      step: 'firstPlayerResolveRally',
    };

    expect(getIsFirstPlayerForResolveRallyStep(state)).toBeTruthy();
  });

  it('given the second player resolve rally step, returns false', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = {
      firstPlayerRallyResolutionState: undefined,
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: undefined,
      step: 'secondPlayerResolveRally',
    };

    expect(getIsFirstPlayerForResolveRallyStep(state)).toBeFalsy();
  });

  it('given discardPlayedCards, throws not on resolveRally with step name', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = {
      firstPlayerRallyResolutionState: undefined,
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: undefined,
      step: 'discardPlayedCards',
    };

    expect(() => getIsFirstPlayerForResolveRallyStep(state)).toThrow(
      'Cleanup phase is not on a resolveRally step: discardPlayedCards',
    );
  });
});
