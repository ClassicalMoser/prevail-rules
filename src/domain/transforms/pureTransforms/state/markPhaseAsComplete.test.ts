import type { CleanupPhaseState, PlayCardsPhaseState } from '@game';
import { CLEANUP_PHASE, PLAY_CARDS_PHASE } from '@game';

import { markPhaseAsComplete } from './markPhaseAsComplete';

/**
 * MarkPhaseAsComplete: Creates a new phase state with the step set to 'complete'.
 */
describe(markPhaseAsComplete, () => {
  it('given mark play cards phase as complete', () => {
    const phaseState: PlayCardsPhaseState = {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    };

    const completedPhase = markPhaseAsComplete(phaseState);

    expect(completedPhase.step).toBe('complete');
    expect(completedPhase.phase).toBe(PLAY_CARDS_PHASE);
    expect(completedPhase).not.toBe(phaseState);
  });

  it('given mark cleanup phase as complete', () => {
    const phaseState: CleanupPhaseState = {
      firstPlayerRallyResolutionState: undefined,
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: undefined,
      step: 'discardPlayedCards',
    };

    const completedPhase = markPhaseAsComplete(phaseState);

    expect(completedPhase.step).toBe('complete');
    expect(completedPhase.phase).toBe(CLEANUP_PHASE);
    expect(completedPhase.firstPlayerRallyResolutionState).toBe(
      phaseState.firstPlayerRallyResolutionState,
    );
    expect(completedPhase).not.toBe(phaseState);
  });

  it('given preserve all other phase state properties', () => {
    const phaseState: CleanupPhaseState = {
      firstPlayerRallyResolutionState: {
        completed: false,
        playerRallied: true,
        rallyResolved: false,
        routState: undefined,
        unitsLostSupport: undefined,
      },
      phase: CLEANUP_PHASE,
      secondPlayerRallyResolutionState: undefined,
      step: 'firstPlayerResolveRally',
    };

    const completedPhase = markPhaseAsComplete(phaseState);

    expect(completedPhase.step).toBe('complete');
    expect(completedPhase.firstPlayerRallyResolutionState).toBe(
      phaseState.firstPlayerRallyResolutionState,
    );
    expect(completedPhase.secondPlayerRallyResolutionState).toBe(
      phaseState.secondPlayerRallyResolutionState,
    );
  });
});
