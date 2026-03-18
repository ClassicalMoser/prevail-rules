import { CLEANUP_PHASE } from '@entities';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { getRallyResolutionStateForCurrentStep } from './getRallyResolutionStateForCurrentStep';

describe('getRallyResolutionStateForCurrentStep', () => {
  it('should return first player rally state when step is firstPlayerResolveRally and player matches', () => {
    const rallyState = {
      playerRallied: true,
      rallyResolved: false,
      unitsLostSupport: undefined,
      routState: undefined,
      completed: false,
    };

    const state = createEmptyGameState();
    state.currentInitiative = 'white';
    state.currentRoundState.currentPhaseState = {
      phase: CLEANUP_PHASE,
      step: 'firstPlayerResolveRally',
      firstPlayerRallyResolutionState: rallyState,
      secondPlayerRallyResolutionState: undefined,
    };

    const result = getRallyResolutionStateForCurrentStep(state, 'white');
    expect(result).toEqual(rallyState);
  });

  it('should return second player rally state when step is secondPlayerResolveRally and player matches', () => {
    const rallyState = {
      playerRallied: true,
      rallyResolved: false,
      unitsLostSupport: undefined,
      routState: undefined,
      completed: false,
    };

    const state = createEmptyGameState();
    state.currentInitiative = 'white';
    state.currentRoundState.currentPhaseState = {
      phase: CLEANUP_PHASE,
      step: 'secondPlayerResolveRally',
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: rallyState,
    };

    const result = getRallyResolutionStateForCurrentStep(state, 'black');
    expect(result).toEqual(rallyState);
  });

  it('should throw when second player attempts to rally out of order', () => {
    const state = createEmptyGameState();
    state.currentInitiative = 'white';
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

    expect(() => getRallyResolutionStateForCurrentStep(state, 'black')).toThrow(
      'Expected white (first player) to resolve rally, got black',
    );
  });

  it('should throw when first player attempts to rally out of order', () => {
    const state = createEmptyGameState();
    state.currentInitiative = 'white';
    state.currentRoundState.currentPhaseState = {
      phase: CLEANUP_PHASE,
      step: 'secondPlayerResolveRally',
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
    };

    expect(() => getRallyResolutionStateForCurrentStep(state, 'white')).toThrow(
      'Expected black (second player) to resolve rally, got white',
    );
  });

  it('should throw when not in a resolveRally step', () => {
    const state = createEmptyGameState();
    state.currentInitiative = 'white';
    state.currentRoundState = {
      roundNumber: 1,
      completedPhases: new Set(),
      currentPhaseState: {
        phase: CLEANUP_PHASE,
        step: 'discardPlayedCards',
        firstPlayerRallyResolutionState: undefined,
        secondPlayerRallyResolutionState: undefined,
      },
      commandedUnits: new Set(),
    };

    expect(() => getRallyResolutionStateForCurrentStep(state, 'white')).toThrow(
      'Cleanup phase is not on a resolveRally step: discardPlayedCards',
    );
  });
});
