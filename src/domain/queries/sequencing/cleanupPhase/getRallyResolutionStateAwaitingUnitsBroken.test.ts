import { CLEANUP_PHASE } from '@game';
import { createEmptyGameState } from '@testing';

import { getRallyResolutionStateAwaitingUnitsBroken } from './getRallyResolutionStateAwaitingUnitsBroken';

/** After card burn: rallyResolved true but unitsLostSupport not computed yet. */
const afterBurnBeforeUnitsBroken = {
  completed: false,
  playerRallied: true,
  rallyResolved: true,
  routState: undefined,
  unitsLostSupport: undefined,
};

/** FirstPlayerResolveRally with post-burn rally slice. */
function stateFirstPlayerResolveRally() {
  const state = createEmptyGameState();
  state.currentInitiative = 'white';
  state.currentRoundState.currentPhaseState = {
    firstPlayerRallyResolutionState: { ...afterBurnBeforeUnitsBroken },
    phase: CLEANUP_PHASE,
    secondPlayerRallyResolutionState: undefined,
    step: 'firstPlayerResolveRally',
  };
  return state;
}

/**
 * Procedure guard before `resolveUnitsBroken`: rally must be resolved and `unitsLostSupport`
 * must still be unset.
 */
describe(getRallyResolutionStateAwaitingUnitsBroken, () => {
  it('given rallyResolved true and unitsLostSupport undefined, returns slice', () => {
    const state = stateFirstPlayerResolveRally();
    const result = getRallyResolutionStateAwaitingUnitsBroken(state, 'white');
    expect(result.rallyResolved).toBeTruthy();
    expect(result.unitsLostSupport).toBeUndefined();
  });

  it('given rallyResolved false, throws rally not resolved yet', () => {
    const state = stateFirstPlayerResolveRally();
    const ps = state.currentRoundState.currentPhaseState;
    if (!ps || ps.phase !== CLEANUP_PHASE) {
      throw new Error('expected cleanup');
    }
    ps.firstPlayerRallyResolutionState = {
      ...afterBurnBeforeUnitsBroken,
      rallyResolved: false,
    };

    expect(() =>
      getRallyResolutionStateAwaitingUnitsBroken(state, 'white'),
    ).toThrow('Rally has not been resolved yet');
  });

  it('given unitsLostSupport already a Set, throws units lost support already resolved', () => {
    const state = stateFirstPlayerResolveRally();
    const ps = state.currentRoundState.currentPhaseState;
    if (!ps || ps.phase !== CLEANUP_PHASE) {
      throw new Error('expected cleanup');
    }
    ps.firstPlayerRallyResolutionState = {
      ...afterBurnBeforeUnitsBroken,
      unitsLostSupport: new Set(),
    };

    expect(() =>
      getRallyResolutionStateAwaitingUnitsBroken(state, 'white'),
    ).toThrow('Units lost support already resolved');
  });
});
