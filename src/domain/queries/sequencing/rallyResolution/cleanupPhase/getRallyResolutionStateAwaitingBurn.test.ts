import type { GameState } from '@game';
import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState, createRallyResolutionState } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getRallyResolutionStateAwaitingBurn } from './getRallyResolutionStateAwaitingBurn';

function firstPlayerResolving(
  rally = createRallyResolutionState({ playerRallied: true }),
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
 * The rally slice after the player has chosen to rally and before the burn.
 */
describe('getRallyResolutionStateAwaitingBurn function', () => {
  it('returns the rally slice waiting for the burn', () => {
    const rally = createRallyResolutionState({ playerRallied: true });
    const state = firstPlayerResolving(rally);

    expect(getRallyResolutionStateAwaitingBurn(state, 'white')).toBe(rally);
  });

  it('throws when the player did not rally', () => {
    const rally = createRallyResolutionState({ playerRallied: false });
    const state = firstPlayerResolving(rally);

    expect(() => getRallyResolutionStateAwaitingBurn(state, 'white')).toThrow(
      'Player did not choose to rally',
    );
  });

  it('throws when the rally burn is already done', () => {
    const rally = createRallyResolutionState({
      playerRallied: true,
      rallyResolved: true,
    });
    const state = firstPlayerResolving(rally);

    expect(() => getRallyResolutionStateAwaitingBurn(state, 'white')).toThrow(
      'Rally has already been resolved',
    );
  });

  it('throws when cleanup is discarding played cards', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const state = updatePhaseState(
      empty,
      createCleanupPhaseState({ step: 'discardPlayedCards' }),
    );

    expect(() => getRallyResolutionStateAwaitingBurn(state, 'white')).toThrow(
      'Cleanup phase is not on a resolveRally step: discardPlayedCards',
    );
  });
});
