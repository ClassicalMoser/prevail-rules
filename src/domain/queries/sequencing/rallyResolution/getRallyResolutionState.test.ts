import type { GameState, RallyResolutionState } from '@game';
import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState, createRallyResolutionState } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getRallyResolutionState } from './getRallyResolutionState';

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
 * A player reads the rally slot for their seat in initiative order.
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
