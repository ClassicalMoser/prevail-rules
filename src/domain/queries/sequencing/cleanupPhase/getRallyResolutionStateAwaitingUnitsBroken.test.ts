import { CLEANUP_PHASE } from '@entities';
import { createEmptyGameState } from '@testing';
import { describe, expect, it } from 'vitest';

import { getRallyResolutionStateAwaitingUnitsBroken } from './getRallyResolutionStateAwaitingUnitsBroken';

const afterBurnBeforeUnitsBroken = {
  playerRallied: true,
  rallyResolved: true,
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
    firstPlayerRallyResolutionState: { ...afterBurnBeforeUnitsBroken },
    secondPlayerRallyResolutionState: undefined,
  };
  return state;
}

describe('getRallyResolutionStateAwaitingUnitsBroken', () => {
  it('returns rally state when burn applied and units broken not yet computed', () => {
    const state = stateFirstPlayerResolveRally();
    const result = getRallyResolutionStateAwaitingUnitsBroken(state, 'white');
    expect(result.rallyResolved).toBe(true);
    expect(result.unitsLostSupport).toBeUndefined();
  });

  it('throws when rally not resolved yet', () => {
    const state = stateFirstPlayerResolveRally();
    const ps = state.currentRoundState.currentPhaseState;
    if (!ps || ps.phase !== CLEANUP_PHASE) throw new Error('expected cleanup');
    ps.firstPlayerRallyResolutionState = {
      ...afterBurnBeforeUnitsBroken,
      rallyResolved: false,
    };

    expect(() =>
      getRallyResolutionStateAwaitingUnitsBroken(state, 'white'),
    ).toThrow('Rally has not been resolved yet');
  });

  it('throws when units lost support already resolved', () => {
    const state = stateFirstPlayerResolveRally();
    const ps = state.currentRoundState.currentPhaseState;
    if (!ps || ps.phase !== CLEANUP_PHASE) throw new Error('expected cleanup');
    ps.firstPlayerRallyResolutionState = {
      ...afterBurnBeforeUnitsBroken,
      unitsLostSupport: new Set(),
    };

    expect(() =>
      getRallyResolutionStateAwaitingUnitsBroken(state, 'white'),
    ).toThrow('Units lost support already resolved');
  });
});
