import type { CleanupPhaseStep, GameState } from '@game';
import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState } from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { findRallyingPlayer } from './findRallyingPlayer';

/** Cleanup on this step, with black holding initiative. */
function cleanupOn(step: CleanupPhaseStep): GameState {
  const empty = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );
  const state = updatePhaseState(empty, createCleanupPhaseState({ step }));
  return state;
}

/**
 * The first player chooses whether to rally and carries it out, then the
 * second does the same (§10.3). Discarding the played cards comes before
 * both rallies, and completing the round after.
 */
describe('findRallyingPlayer function', () => {
  it('names the first player on both of the first player’s rally steps', () => {
    expect(findRallyingPlayer(cleanupOn('firstPlayerChooseRally'))).toBe(
      'black',
    );
    expect(findRallyingPlayer(cleanupOn('firstPlayerResolveRally'))).toBe(
      'black',
    );
  });

  it('names the second player on both of the second player’s rally steps', () => {
    expect(findRallyingPlayer(cleanupOn('secondPlayerChooseRally'))).toBe(
      'white',
    );
    expect(findRallyingPlayer(cleanupOn('secondPlayerResolveRally'))).toBe(
      'white',
    );
  });

  it('names nobody before the rallies or after them', () => {
    expect(findRallyingPlayer(cleanupOn('discardPlayedCards'))).toBeUndefined();
    expect(findRallyingPlayer(cleanupOn('complete'))).toBeUndefined();
  });
});
