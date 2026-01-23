import type { RallyResolutionState } from '@entities';
import {
  createCleanupPhaseState,
  createEmptyGameState,
  createTestUnit,
} from '@testing';
import { describe, expect, it } from 'vitest';
import {
  getCurrentRallyResolutionState,
  getRallyResolutionState,
  getRoutStateFromRally,
} from './rally';

describe('getRallyResolutionState', () => {
  it('should return first player rally state when player is first player', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: 'firstPlayerChooseRally',
      firstPlayerRallyResolutionState: {
        playerRallied: true,
        rallyResolved: false,
        unitsLostSupport: undefined,
        routState: undefined,
        completed: false,
      },
      secondPlayerRallyResolutionState: undefined,
    });

    const result = getRallyResolutionState(state, 'black');
    expect(result.playerRallied).toBe(true);
  });

  it('should return second player rally state when player is second player', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: 'firstPlayerChooseRally',
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: {
        playerRallied: false,
        rallyResolved: false,
        unitsLostSupport: undefined,
        routState: undefined,
        completed: false,
      },
    });

    const result = getRallyResolutionState(state, 'white');
    expect(result.playerRallied).toBe(false);
  });

  it('should throw error when rally state is missing', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: 'firstPlayerChooseRally',
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
    });

    expect(() => getRallyResolutionState(state, 'black')).toThrow(
      'No black rally resolution state found',
    );
  });
});

describe('getCurrentRallyResolutionState', () => {
  it('should return first player rally state when step is firstPlayerResolveRally', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: 'firstPlayerResolveRally',
      firstPlayerRallyResolutionState: {
        playerRallied: true,
        rallyResolved: false,
        unitsLostSupport: undefined,
        routState: undefined,
        completed: false,
      },
      secondPlayerRallyResolutionState: undefined,
    });

    const result = getCurrentRallyResolutionState(state);
    expect(result.playerRallied).toBe(true);
  });

  it('should return second player rally state when step is secondPlayerResolveRally', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: 'secondPlayerResolveRally',
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: {
        playerRallied: true,
        rallyResolved: false,
        unitsLostSupport: undefined,
        routState: undefined,
        completed: false,
      },
    });

    const result = getCurrentRallyResolutionState(state);
    expect(result.playerRallied).toBe(true);
  });

  it('should throw error when not in resolveRally step', () => {
    const state = createEmptyGameState();
    state.currentRoundState.currentPhaseState = createCleanupPhaseState({
      step: 'discardPlayedCards',
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
    });

    expect(() => getCurrentRallyResolutionState(state)).toThrow(
      'Not in a resolveRally step',
    );
  });
});

describe('getRoutStateFromRally', () => {
  it('should return rout state from rally resolution state', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const rallyState: RallyResolutionState = {
      playerRallied: true,
      rallyResolved: true,
      unitsLostSupport: new Set(),
      routState: {
        substepType: 'rout' as const,
        player: 'black' as const,
        unitsToRout: new Set([unit]),
        numberToDiscard: 1,
        cardsChosen: false,
        completed: false,
      },
      completed: false,
    };

    const result = getRoutStateFromRally(rallyState);
    expect(result.substepType).toBe('rout');
    expect(result.player).toBe('black');
  });

  it('should throw error when rout state is missing', () => {
    const rallyState: RallyResolutionState = {
      playerRallied: true,
      rallyResolved: true,
      unitsLostSupport: new Set(),
      routState: undefined,
      completed: false,
    };

    expect(() => getRoutStateFromRally(rallyState)).toThrow(
      'No rout state found in rally resolution state',
    );
  });
});
