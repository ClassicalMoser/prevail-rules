import { CLEANUP_PHASE } from '@game';

import { getIsFirstPlayerForResolveRallyStep } from './getIsFirstPlayerForResolveRallyStep';

import { createEmptyGameState } from '@factories';
/**
 * Cleanup resolve-rally steps alternate first vs second player; this boolean matches the step name.
 */
describe(getIsFirstPlayerForResolveRallyStep, () => {
  it('given firstPlayerResolveRally, returns true', () => {
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState = {
      firstPlayerRallyResolutionState: 'pending' as const,
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: 'pending' as const,
      step: 'firstPlayerResolveRally',
    };

    expect(getIsFirstPlayerForResolveRallyStep(state)).toBe(true);
  });

  it('given the second player resolve rally step, returns false', () => {
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState = {
      firstPlayerRallyResolutionState: 'pending' as const,
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: 'pending' as const,
      step: 'secondPlayerResolveRally',
    };

    expect(getIsFirstPlayerForResolveRallyStep(state)).toBe(false);
  });

  it('given discardPlayedCards, throws not on resolveRally with step name', () => {
    const state = createEmptyGameState('standard');
    state.currentRoundState.currentPhaseState = {
      firstPlayerRallyResolutionState: 'pending' as const,
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: 'pending' as const,
      step: 'discardPlayedCards',
    };

    expect(() => getIsFirstPlayerForResolveRallyStep(state)).toThrow(
      'Cleanup phase is not on a resolveRally step: discardPlayedCards',
    );
  });
});
