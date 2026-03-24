import { CLEANUP_PHASE } from '@entities';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { getNextStepForResolveRally } from './getNextStepForResolveRally';

/**
 * After finishing one side’s resolve-rally work, which cleanup step comes next (second chooser
 * vs phase complete).
 */
describe('getNextStepForResolveRally', () => {
  it('given firstPlayerResolveRally, next step is secondPlayerChooseRally', () => {
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

  it('given step is secondPlayerResolveRally, returns complete', () => {
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

  it('given discardPlayedCards, throws not on resolveRally step', () => {
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
