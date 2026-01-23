import { CLEANUP_PHASE } from '@entities';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { getNextStepForResolveRally } from './getNextStepForResolveRally';

describe('getNextStepForResolveRally', () => {
  it('should return secondPlayerChooseRally when step is firstPlayerResolveRally', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = {
      phase: CLEANUP_PHASE,
      step: 'firstPlayerResolveRally',
      firstPlayerRallyResolutionState: {
        playerRallied: true,
        rallyResolved: false,
        unitsLostSupport: undefined,
        routState: undefined,
        completed: false,
      },
      secondPlayerRallyResolutionState: undefined,
    };

    const result = getNextStepForResolveRally(state);
    expect(result).toBe('secondPlayerChooseRally');
  });

  it('should return complete when step is secondPlayerResolveRally', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = {
      phase: CLEANUP_PHASE,
      step: 'secondPlayerResolveRally',
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: {
        playerRallied: true,
        rallyResolved: false,
        unitsLostSupport: undefined,
        routState: undefined,
        completed: false,
      },
    };

    const result = getNextStepForResolveRally(state);
    expect(result).toBe('complete');
  });

  it('should throw error when not in resolveRally step', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = {
      phase: CLEANUP_PHASE,
      step: 'discardPlayedCards',
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
    };

    expect(() => getNextStepForResolveRally(state)).toThrow(
      'Cleanup phase is not on a resolveRally step',
    );
  });
});
