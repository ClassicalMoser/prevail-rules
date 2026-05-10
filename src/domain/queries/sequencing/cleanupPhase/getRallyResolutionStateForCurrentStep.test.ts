import { CLEANUP_PHASE } from '@game';
import { createEmptyGameState } from '@testing';

import { getRallyResolutionStateForCurrentStep } from './getRallyResolutionStateForCurrentStep';

/**
 * Ensures the acting player matches initiative ordering for the current resolve-rally step,
 * then returns the corresponding first/second rally bucket.
 */
describe(getRallyResolutionStateForCurrentStep, () => {
  it('given firstPlayerResolveRally and white is first, returns first bucket for white', () => {
    const rallyState = {
      completed: false,
      playerRallied: true,
      rallyResolved: false,
      routState: undefined,
      unitsLostSupport: undefined,
    };

    const state = createEmptyGameState();
    state.currentInitiative = 'white';
    state.currentRoundState.currentPhaseState = {
      firstPlayerRallyResolutionState: rallyState,
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: undefined,
      step: 'firstPlayerResolveRally',
    };

    const result = getRallyResolutionStateForCurrentStep(state, 'white');
    expect(result).toStrictEqual(rallyState);
  });

  it('given secondPlayerResolveRally and black is second, returns second bucket for black', () => {
    const rallyState = {
      completed: false,
      playerRallied: true,
      rallyResolved: false,
      routState: undefined,
      unitsLostSupport: undefined,
    };

    const state = createEmptyGameState();
    state.currentInitiative = 'white';
    state.currentRoundState.currentPhaseState = {
      firstPlayerRallyResolutionState: undefined,
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: rallyState,
      step: 'secondPlayerResolveRally',
    };

    const result = getRallyResolutionStateForCurrentStep(state, 'black');
    expect(result).toStrictEqual(rallyState);
  });

  it('given firstPlayerResolveRally but caller black, throws expected first player white', () => {
    const state = createEmptyGameState();
    state.currentInitiative = 'white';
    state.currentRoundState.currentPhaseState = {
      firstPlayerRallyResolutionState: {
        completed: false,
        playerRallied: true,
        rallyResolved: false,
        routState: undefined,
        unitsLostSupport: undefined,
      },
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: undefined,
      step: 'firstPlayerResolveRally',
    };

    expect(() => getRallyResolutionStateForCurrentStep(state, 'black')).toThrow(
      'Expected white (first player) to resolve rally, got black',
    );
  });

  it('given secondPlayerResolveRally but caller white, throws expected second player black', () => {
    const state = createEmptyGameState();
    state.currentInitiative = 'white';
    state.currentRoundState.currentPhaseState = {
      firstPlayerRallyResolutionState: undefined,
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: undefined,
      step: 'secondPlayerResolveRally',
    };

    expect(() => getRallyResolutionStateForCurrentStep(state, 'white')).toThrow(
      'Expected black (second player) to resolve rally, got white',
    );
  });

  it('given discardPlayedCards, throws not on resolveRally step with step name', () => {
    const state = createEmptyGameState();
    state.currentInitiative = 'white';
    state.currentRoundState = {
      boardType: 'standard',
      commandedUnits: new Set(),
      completedPhases: new Set(),
      currentPhaseState: {
        firstPlayerRallyResolutionState: undefined,
        phase: CLEANUP_PHASE,
        secondPlayerRallyResolutionState: undefined,
        step: 'discardPlayedCards',
      },
      events: [],
      roundNumber: 1,
    };

    expect(() => getRallyResolutionStateForCurrentStep(state, 'white')).toThrow(
      'Cleanup phase is not on a resolveRally step: discardPlayedCards',
    );
  });
});
