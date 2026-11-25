import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState, createRallyResolutionState } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getRallyResolutionStateAwaitingUnitSupport } from './getRallyResolutionStateAwaitingUnitSupport';

/**
 * Right after the burn, with every card back in hand, the rallying player
 * assigns their units to support (§10.4.1), once.
 */
describe('getRallyResolutionStateAwaitingUnitSupport function', () => {
  // Black holds the initiative, so black rallies first (§10.3.1).
  const blackFirst = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );

  it('returns the rally waiting for unit support', () => {
    // Black has burnt a card, and the support check is still to make.
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      unitsLostSupport: 'pending',
    });
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: rally,
        step: 'firstPlayerResolveRally',
      }),
    );

    // Black's rally, ready for the support check.
    expect(getRallyResolutionStateAwaitingUnitSupport(state, 'black')).toBe(
      rally,
    );
  });

  it('throws when the rally burn is not done', () => {
    // Black chose to rally, but the cards are not back in hand yet.
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: false,
    });
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: rally,
        step: 'firstPlayerResolveRally',
      }),
    );

    // Support is checked only after the burn.
    expect(() =>
      getRallyResolutionStateAwaitingUnitSupport(state, 'black'),
    ).toThrow('Rally has not been resolved yet');
  });

  it('throws when units lost support are already recorded', () => {
    // The support check is made, and no unit lost its place.
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      unitsLostSupport: [],
    });
    const state = updatePhaseState(
      blackFirst,
      createCleanupPhaseState({
        firstPlayerRallyResolutionState: rally,
        step: 'firstPlayerResolveRally',
      }),
    );

    // The check is made once.
    expect(() =>
      getRallyResolutionStateAwaitingUnitSupport(state, 'black'),
    ).toThrow('Units lost support already resolved');
  });
});
