import { CLEANUP_PHASE } from '@entities';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';

import { getRallyResolutionStateAwaitingBurn } from './getRallyResolutionStateAwaitingBurn';

const readyToBurn = {
  playerRallied: true,
  rallyResolved: false,
  unitsLostSupport: undefined,
  routState: undefined,
  completed: false,
};

function stateFirstPlayerResolveRally() {
  const state = createEmptyGameState();
  state.currentInitiative = 'white';
  state.currentRoundState.currentPhaseState = {
    phase: CLEANUP_PHASE,
    step: 'firstPlayerResolveRally',
    firstPlayerRallyResolutionState: { ...readyToBurn },
    secondPlayerRallyResolutionState: undefined,
  };
  return state;
}

describe('getRallyResolutionStateAwaitingBurn', () => {
  it('returns rally state when player chose rally and burn not applied', () => {
    const state = stateFirstPlayerResolveRally();
    const result = getRallyResolutionStateAwaitingBurn(state, 'white');
    expect(result.playerRallied).toBe(true);
    expect(result.rallyResolved).toBe(false);
  });

  it('throws when player did not choose to rally', () => {
    const state = stateFirstPlayerResolveRally();
    const ps = state.currentRoundState.currentPhaseState;
    if (!ps || ps.phase !== CLEANUP_PHASE) throw new Error('expected cleanup');
    ps.firstPlayerRallyResolutionState = {
      ...readyToBurn,
      playerRallied: false,
    };

    expect(() => getRallyResolutionStateAwaitingBurn(state, 'white')).toThrow(
      'Player did not choose to rally',
    );
  });

  it('throws when rally already resolved', () => {
    const state = stateFirstPlayerResolveRally();
    const ps = state.currentRoundState.currentPhaseState;
    if (!ps || ps.phase !== CLEANUP_PHASE) throw new Error('expected cleanup');
    ps.firstPlayerRallyResolutionState = {
      ...readyToBurn,
      rallyResolved: true,
    };

    expect(() => getRallyResolutionStateAwaitingBurn(state, 'white')).toThrow(
      'Rally has already been resolved',
    );
  });

  it('delegates step/player validation to getRallyResolutionStateForCurrentStep', () => {
    const state = createEmptyGameState();
    state.currentInitiative = 'white';
    state.currentRoundState.currentPhaseState = {
      phase: CLEANUP_PHASE,
      step: 'discardPlayedCards',
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
    };

    expect(() => getRallyResolutionStateAwaitingBurn(state, 'white')).toThrow(
      'Cleanup phase is not on a resolveRally step: discardPlayedCards',
    );
  });
});
