import type { GameState, RallyResolutionState } from '@game';
import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState, createRallyResolutionState } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getCurrentRallyResolutionState } from './getCurrentRallyResolutionState';

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
 * The resolve step reads that player's rally. Any other cleanup step throws.
 */
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
