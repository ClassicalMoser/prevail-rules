import { createCleanupPhaseState } from './cleanupPhaseState';

/** Phase 5 as it opens: cards leave play, and neither player has chosen whether to rally (§4.5). */
describe('createCleanupPhaseState function', () => {
  it('opens on the cards leaving play, neither rally decided', () => {
    const phase = createCleanupPhaseState();

    expect(phase).toStrictEqual({
      firstPlayerRallyResolutionState: 'pending',
      phase: 'cleanup',
      secondPlayerRallyResolutionState: 'pending',
      step: 'cardsLeavePlay',
    });
  });
});
