import type { GameState } from '@game';
import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState, createRallyResolutionState } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getRallyResolutionStateAwaitingUnitSupport } from './getRallyResolutionStateAwaitingUnitSupport';

function firstPlayerResolving(
  rally: ReturnType<typeof createRallyResolutionState>,
): GameState {
  const empty = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'white',
  );
  return updatePhaseState(
    empty,
    createCleanupPhaseState({
      firstPlayerRallyResolutionState: rally,
      step: 'firstPlayerResolveRally',
    }),
  );
}

/**
 * The rally slice after the burn and before units lost support are recorded.
 */
describe('getRallyResolutionStateAwaitingUnitSupport function', () => {
  it('returns the rally slice waiting for unit support', () => {
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      unitsLostSupport: 'pending',
    });
    const state = firstPlayerResolving(rally);

    expect(getRallyResolutionStateAwaitingUnitSupport(state, 'white')).toBe(
      rally,
    );
  });

  it('throws when the rally burn is not done', () => {
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: false,
    });
    const state = firstPlayerResolving(rally);

    expect(() =>
      getRallyResolutionStateAwaitingUnitSupport(state, 'white'),
    ).toThrow('Rally has not been resolved yet');
  });

  it('throws when units lost support are already recorded', () => {
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      unitsLostSupport: [],
    });
    const state = firstPlayerResolving(rally);

    expect(() =>
      getRallyResolutionStateAwaitingUnitSupport(state, 'white'),
    ).toThrow('Units lost support already resolved');
  });
});
