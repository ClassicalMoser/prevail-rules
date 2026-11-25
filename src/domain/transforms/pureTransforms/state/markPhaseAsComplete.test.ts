import {
  createCleanupPhaseState,
  createPlayCardsPhaseState,
  createRallyResolutionState,
} from '@testing';

import { markPhaseAsComplete } from './markPhaseAsComplete';

/**
 * A phase brought to its end keeps everything it recorded on the way, its
 * step now `complete`.
 */
describe('markPhaseAsComplete function', () => {
  it('ends a phase at its first step, leaving the phase it was given as it was', () => {
    // Play Cards, both players still choosing (§4.1.1).
    const playCards = createPlayCardsPhaseState();

    const completed = markPhaseAsComplete(playCards);

    // The same phase, at its end; the one given is still choosing.
    expect(completed).toStrictEqual({ phase: 'playCards', step: 'complete' });
    expect(playCards.step).toBe('chooseCards');
  });

  it('keeps what the phase recorded on the way to its end', () => {
    // Cleanup, the first player's rally under way (§4.5.2).
    const rally = createRallyResolutionState({ playerRallied: true });
    const cleanup = createCleanupPhaseState({
      firstPlayerRallyResolutionState: rally,
      step: 'firstPlayerResolveRally',
    });

    const completed = markPhaseAsComplete(cleanup);

    // Still Cleanup, at its end, the first player's rally and the second
    // player's undecided one as they were.
    expect(completed.phase).toBe('cleanup');
    expect(completed.step).toBe('complete');
    expect(completed.firstPlayerRallyResolutionState).toBe(rally);
    expect(completed.secondPlayerRallyResolutionState).toBe('pending');
  });
});
