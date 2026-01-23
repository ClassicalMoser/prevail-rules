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

  it('should throw when player does not match step', () => {
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
});
