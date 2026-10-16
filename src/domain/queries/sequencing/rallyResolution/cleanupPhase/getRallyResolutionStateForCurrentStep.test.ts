import type { GameState, RallyResolutionState } from '@game';
import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState, createRallyResolutionState } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getRallyResolutionStateForCurrentStep } from './getRallyResolutionStateForCurrentStep';

function cleanup(
  step:
    | 'firstPlayerResolveRally'
    | 'secondPlayerResolveRally'
    | 'discardPlayedCards',
  buckets: {
    first?: RallyResolutionState | 'pending';
    second?: RallyResolutionState | 'pending';
  } = {},
): GameState {
  const empty = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'white',
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
 * The rally slice for the resolve step, when the caller is the player
 * that step belongs to.
 */
describe('getRallyResolutionStateForCurrentStep function', () => {
  it('returns the first player rally when that player is resolving', () => {
    const rally = createRallyResolutionState({ playerRallied: true });
    const state = cleanup('firstPlayerResolveRally', { first: rally });

    expect(getRallyResolutionStateForCurrentStep(state, 'white')).toBe(rally);
  });

  it('returns the second player rally when that player is resolving', () => {
    const rally = createRallyResolutionState({ playerRallied: true });
    const state = cleanup('secondPlayerResolveRally', { second: rally });

    expect(getRallyResolutionStateForCurrentStep(state, 'black')).toBe(rally);
  });

  it('throws when the second player calls during the first resolve', () => {
    const state = cleanup('firstPlayerResolveRally', {
      first: createRallyResolutionState({ playerRallied: true }),
    });

    expect(() => getRallyResolutionStateForCurrentStep(state, 'black')).toThrow(
      'Expected white (first player) to resolve rally, got black',
    );
  });

  it('throws when the first player calls during the second resolve', () => {
    const state = cleanup('secondPlayerResolveRally');

    expect(() => getRallyResolutionStateForCurrentStep(state, 'white')).toThrow(
      'Expected black (second player) to resolve rally, got white',
    );
  });

  it('throws when cleanup is discarding played cards', () => {
    const state = cleanup('discardPlayedCards');

    expect(() => getRallyResolutionStateForCurrentStep(state, 'white')).toThrow(
      'Cleanup phase is not on a resolveRally step: discardPlayedCards',
    );
  });
});
