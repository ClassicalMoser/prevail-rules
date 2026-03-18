import { CLEANUP_PHASE } from '@entities';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { getIsFirstPlayerForResolveRallyStep } from './getIsFirstPlayerForResolveRallyStep';

describe('getIsFirstPlayerForResolveRallyStep', () => {
  it('should return true for the first player resolve rally step', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = {
      phase: CLEANUP_PHASE,
      step: 'firstPlayerResolveRally',
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
    };

    expect(getIsFirstPlayerForResolveRallyStep(state)).toBe(true);
  });

  it('should return false for the second player resolve rally step', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = {
      phase: CLEANUP_PHASE,
      step: 'secondPlayerResolveRally',
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
    };

    expect(getIsFirstPlayerForResolveRallyStep(state)).toBe(false);
  });

  it('should throw when cleanup is not on a resolve rally step', () => {
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
