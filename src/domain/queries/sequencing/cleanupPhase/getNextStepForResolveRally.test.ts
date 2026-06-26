import { CLEANUP_PHASE } from '@game';
import { createEmptyGameState } from '@testing';

import { getNextStepForResolveRally } from './getNextStepForResolveRally';

/**
 * After finishing one side’s resolve-rally work, which cleanup step comes next (second chooser
 * vs phase complete).
 */
describe(getNextStepForResolveRally, () => {
  it('given firstPlayerResolveRally, next step is secondPlayerChooseRally', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = {
      firstPlayerRallyResolutionState: {
        completed: false,
        playerRallied: true,
        rallyResolved: false,
        routState: 'pending' as const,
        unitsLostSupport: 'pending' as const,
      },
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: 'pending' as const,
      step: 'firstPlayerResolveRally',
    };

    const result = getNextStepForResolveRally(state);
    expect(result).toBe('secondPlayerChooseRally');
  });

  it('given step is secondPlayerResolveRally, returns complete', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = {
      firstPlayerRallyResolutionState: 'pending' as const,
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: {
        completed: false,
        playerRallied: true,
        rallyResolved: false,
        routState: 'pending' as const,
        unitsLostSupport: 'pending' as const,
      },
      step: 'secondPlayerResolveRally',
    };

    const result = getNextStepForResolveRally(state);
    expect(result).toBe('complete');
  });

  it('given discardPlayedCards, throws not on resolveRally step', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = {
      firstPlayerRallyResolutionState: 'pending' as const,
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: 'pending' as const,
      step: 'discardPlayedCards',
    };

    expect(() => getNextStepForResolveRally(state)).toThrow(
      'Cleanup phase is not on a resolveRally step',
    );
  });
});
