import { CLEANUP_PHASE } from '@game';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { getIsFirstPlayerForResolveRallyStep } from './getIsFirstPlayerForResolveRallyStep';

/**
 * Cleanup resolve-rally steps alternate first vs second player; this boolean matches the step name.
 */
describe('getIsFirstPlayerForResolveRallyStep', () => {
  it('given firstPlayerResolveRally, returns true', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = {
      phase: CLEANUP_PHASE,
      step: 'firstPlayerResolveRally',
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
    };

    expect(getIsFirstPlayerForResolveRallyStep(state)).toBe(true);
  });

  it('given the second player resolve rally step, returns false', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = {
      phase: CLEANUP_PHASE,
      step: 'secondPlayerResolveRally',
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
    };

    expect(getIsFirstPlayerForResolveRallyStep(state)).toBe(false);
  });

  it('given discardPlayedCards, throws not on resolveRally with step name', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = {
      phase: CLEANUP_PHASE,
      step: 'discardPlayedCards',
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
    };

    expect(() => getIsFirstPlayerForResolveRallyStep(state)).toThrow(
      'Cleanup phase is not on a resolveRally step: discardPlayedCards',
    );
  });
});
