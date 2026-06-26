import { CLEANUP_PHASE } from '@game';
import { createEmptyGameState } from '@testing';

import { getRallyResolutionStateAwaitingBurn } from './getRallyResolutionStateAwaitingBurn';

/** Rally slice ready for resolveRally card burn: rallied yes, not yet rallyResolved. */
const readyToBurn = {
  completed: false,
  playerRallied: true,
  rallyResolved: false,
  routState: 'pending' as const,
  unitsLostSupport: 'pending' as const,
};

/** Cleanup on firstPlayerResolveRally with white initiative. */
function stateFirstPlayerResolveRally() {
  const state = createEmptyGameState();
  state.currentInitiative = 'white';
  state.currentRoundState.currentPhaseState = {
    firstPlayerRallyResolutionState: { ...readyToBurn },
    phase: CLEANUP_PHASE,
    secondPlayerRallyResolutionState: 'pending' as const,
    step: 'firstPlayerResolveRally',
  };
  return state;
}

/**
 * GetRallyResolutionStateAwaitingBurn: returns the rally-resolution slice for the given player when cleanup is on
 * a resolveRally step and that player has chosen to rally but the burn has not been applied yet. Throws if the
 * player did not rally, rally is already resolved, or the phase step is wrong.
 */
describe(getRallyResolutionStateAwaitingBurn, () => {
  it('given rallied and not rallyResolved, returns first-player rally slice', () => {
    const state = stateFirstPlayerResolveRally();
    const result = getRallyResolutionStateAwaitingBurn(state, 'white');
    expect(result.playerRallied).toBeTruthy();
    expect(result.rallyResolved).toBeFalsy();
  });

  it('given playerRallied false, throws player did not choose to rally', () => {
    const state = stateFirstPlayerResolveRally();
    const ps = state.currentRoundState.currentPhaseState;
    if (ps === 'none' || ps.phase !== CLEANUP_PHASE) {
      throw new Error('expected cleanup');
    }
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
    if (ps === 'none' || ps.phase !== CLEANUP_PHASE) {
      throw new Error('expected cleanup');
    }
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
      firstPlayerRallyResolutionState: 'pending' as const,
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: 'pending' as const,
      step: 'discardPlayedCards',
    };

    expect(() => getRallyResolutionStateAwaitingBurn(state, 'white')).toThrow(
      'Cleanup phase is not on a resolveRally step: discardPlayedCards',
    );
  });
});
