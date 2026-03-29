import { CLEANUP_PHASE } from '@game';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';

import { getRallyResolutionStateAwaitingBurn } from './getRallyResolutionStateAwaitingBurn';

/** Rally slice ready for resolveRally card burn: rallied yes, not yet rallyResolved. */
const readyToBurn = {
  playerRallied: true,
  rallyResolved: false,
  unitsLostSupport: undefined,
  routState: undefined,
  completed: false,
};

/** Cleanup on firstPlayerResolveRally with white initiative. */
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

/**
 * getRallyResolutionStateAwaitingBurn: returns the rally-resolution slice for the given player when cleanup is on
 * a resolveRally step and that player has chosen to rally but the burn has not been applied yet. Throws if the
 * player did not rally, rally is already resolved, or the phase step is wrong.
 */
describe('getRallyResolutionStateAwaitingBurn', () => {
  it('given rallied and not rallyResolved, returns first-player rally slice', () => {
    const state = stateFirstPlayerResolveRally();
    const result = getRallyResolutionStateAwaitingBurn(state, 'white');
    expect(result.playerRallied).toBe(true);
    expect(result.rallyResolved).toBe(false);
  });

  it('given playerRallied false, throws player did not choose to rally', () => {
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

  it('given rallyResolved true, throws rally already resolved', () => {
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

  it('given wrong cleanup step discardPlayedCards, throws resolveRally step guard from delegate', () => {
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
