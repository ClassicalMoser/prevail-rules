import type { GameState, RallyResolutionState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createCleanupPhaseState,
  createRallyResolutionState,
  createRoutState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import {
  getCurrentRallyResolutionState,
  getRallyResolutionState,
  getRoutStateFromCleanupPhaseForResolveRout,
  getRoutStateFromRally,
} from './rally';

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
 * Cleanup rally readers. A player reads the bucket for their seat.
 * The current step reads the bucket for that step. Rout readers unwrap
 * the rout nested on a rally slice.
 */
describe('getRallyResolutionState function', () => {
  it('returns the first player rally slice', () => {
    const rally = createRallyResolutionState({ playerRallied: true });
    const state = withCleanup('firstPlayerChooseRally', { first: rally });

    expect(getRallyResolutionState(state, 'white')).toBe(rally);
  });

  it('returns the second player rally slice', () => {
    const rally = createRallyResolutionState({ playerRallied: true });
    const state = withCleanup('firstPlayerChooseRally', { second: rally });

    expect(getRallyResolutionState(state, 'black')).toBe(rally);
  });

  it('throws when the first player rally is still pending', () => {
    const state = withCleanup('firstPlayerChooseRally', { first: 'pending' });

    expect(() => getRallyResolutionState(state, 'white')).toThrow(
      'No white rally resolution state found',
    );
  });
});

describe('getCurrentRallyResolutionState function', () => {
  it('returns the first player rally on the first resolve step', () => {
    const rally = createRallyResolutionState({ playerRallied: true });
    const state = withCleanup('firstPlayerResolveRally', { first: rally });

    expect(getCurrentRallyResolutionState(state)).toBe(rally);
  });

  it('throws when the first player rally is still pending', () => {
    const state = withCleanup('firstPlayerResolveRally', { first: 'pending' });

    expect(() => getCurrentRallyResolutionState(state)).toThrow(
      'No first player rally resolution state found',
    );
  });

  it('returns the second player rally on the second resolve step', () => {
    const rally = createRallyResolutionState({ playerRallied: true });
    const state = withCleanup('secondPlayerResolveRally', { second: rally });

    expect(getCurrentRallyResolutionState(state)).toBe(rally);
  });

  it('throws when the second player rally is still pending', () => {
    const state = withCleanup('secondPlayerResolveRally', {
      second: 'pending',
    });

    expect(() => getCurrentRallyResolutionState(state)).toThrow(
      'No second player rally resolution state found',
    );
  });

  it('throws when cleanup is discarding played cards', () => {
    const state = withCleanup('discardPlayedCards', {});

    expect(() => getCurrentRallyResolutionState(state)).toThrow(
      'Not in a resolveRally step',
    );
  });
});

describe('getRoutStateFromRally function', () => {
  it('returns the rout on the rally slice', () => {
    const rout = createRoutState(
      'black',
      createTestUnit('black', { attack: 2 }),
      {
        numberToDiscard: 1,
      },
    );
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: rout,
    });

    expect(getRoutStateFromRally(rally)).toBe(rout);
  });

  it('throws when the rally rout is still pending', () => {
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
      routState: 'pending',
    });

    expect(() => getRoutStateFromRally(rally)).toThrow(
      'No rout state found in rally resolution state',
    );
  });
});

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
