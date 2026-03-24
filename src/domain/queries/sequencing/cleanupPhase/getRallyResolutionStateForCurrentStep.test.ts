import { CLEANUP_PHASE } from '@entities';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';
import { getRallyResolutionStateForCurrentStep } from './getRallyResolutionStateForCurrentStep';

/**
 * Ensures the acting player matches initiative ordering for the current resolve-rally step,
 * then returns the corresponding first/second rally bucket.
 */
describe('getRallyResolutionStateForCurrentStep', () => {
  it('given firstPlayerResolveRally and white is first, returns first bucket for white', () => {
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

  it('given secondPlayerResolveRally and black is second, returns second bucket for black', () => {
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

  it('given firstPlayerResolveRally but caller black, throws expected first player white', () => {
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

  it('given secondPlayerResolveRally but caller white, throws expected second player black', () => {
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

  it('given discardPlayedCards, throws not on resolveRally step with step name', () => {
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
