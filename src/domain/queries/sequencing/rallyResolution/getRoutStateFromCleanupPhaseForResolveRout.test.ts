import type { GameState, RallyResolutionState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createCleanupPhaseState,
  createRallyResolutionState,
  createRoutState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getRoutStateFromCleanupPhaseForResolveRout } from './getRoutStateFromCleanupPhaseForResolveRout';

function withCleanup(
  step:
    | 'firstPlayerChooseRally'
    | 'firstPlayerResolveRally'
    | 'secondPlayerResolveRally'
    | 'discardPlayedCards',
  buckets: {
    first?: RallyResolutionState | 'pending';
    second?: RallyResolutionState | 'pending';
  },
  initiative: 'white' | 'black' = 'white',
): GameState {
  const empty = updateCurrentInitiative(
    createEmptyGameState('standard'),
    initiative,
  );
  return updatePhaseState(
    empty,
    createCleanupPhaseState({
      firstPlayerRallyResolutionState: buckets.first ?? 'pending',
      secondPlayerRallyResolutionState: buckets.second ?? 'pending',
      step,
    }),
  );
}

/**
 * The current cleanup step picks one rally, then this returns its rout.
 */
describe('getRoutStateFromCleanupPhaseForResolveRout function', () => {
  it('returns the rout on the first player rally', () => {
    const rout = createRoutState(
      'white',
      createTestUnit('white', { attack: 2 }),
      { numberToDiscard: 1 },
    );
    const state = withCleanup('firstPlayerResolveRally', {
      first: createRallyResolutionState({
        playerRallied: true,
        rallyResolved: true,
        routState: rout,
      }),
    });

    expect(getRoutStateFromCleanupPhaseForResolveRout(state)).toBe(rout);
  });

  it('returns the rout on the second player rally', () => {
    const rout = createRoutState(
      'black',
      createTestUnit('black', { attack: 2 }),
      { numberToDiscard: 1 },
    );
    const state = withCleanup('secondPlayerResolveRally', {
      second: createRallyResolutionState({
        playerRallied: true,
        rallyResolved: true,
        routState: rout,
      }),
    });

    expect(getRoutStateFromCleanupPhaseForResolveRout(state)).toBe(rout);
  });

  it('throws when the rally rout is still pending', () => {
    const state = withCleanup('firstPlayerResolveRally', {
      first: createRallyResolutionState({
        playerRallied: true,
        rallyResolved: true,
        routState: 'pending',
      }),
    });

    expect(() => getRoutStateFromCleanupPhaseForResolveRout(state)).toThrow(
      'No rout state found in rally resolution',
    );
  });
});
