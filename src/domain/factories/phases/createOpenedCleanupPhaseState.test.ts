import { createOpenedCleanupPhaseState } from './createOpenedCleanupPhaseState';

/** Phase 5 as it opens. */
describe('createOpenedCleanupPhaseState function', () => {
  it('opens with the cards leaving play and neither rally decided', () => {
    expect(createOpenedCleanupPhaseState()).toStrictEqual({
      firstPlayerRallyResolutionState: 'pending',
      phase: 'cleanup',
      secondPlayerRallyResolutionState: 'pending',
      step: 'cardsLeavePlay',
    });
  });
});
