import { CLEANUP_PHASE, PLAY_CARDS_PHASE } from '@entities';
import { describe, expect, it } from 'vitest';
import { markPhaseAsComplete } from './markPhaseAsComplete';

describe('markPhaseAsComplete', () => {
  it('should mark play cards phase as complete', () => {
    const phaseState = {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards' as const,
    };

    const completedPhase = markPhaseAsComplete(phaseState);

    expect(completedPhase.step).toBe('complete');
    expect(completedPhase.phase).toBe(PLAY_CARDS_PHASE);
    expect(completedPhase).not.toBe(phaseState);
  });

  it('should mark cleanup phase as complete', () => {
    const phaseState = {
      phase: CLEANUP_PHASE,
      step: 'discardPlayedCards' as const,
      firstPlayerRallyResolutionState: undefined,
      secondPlayerRallyResolutionState: undefined,
    };

    const completedPhase = markPhaseAsComplete(phaseState);

    expect(completedPhase.step).toBe('complete');
    expect(completedPhase.phase).toBe(CLEANUP_PHASE);
    expect(completedPhase.firstPlayerRallyResolutionState).toBe(
      phaseState.firstPlayerRallyResolutionState,
    );
    expect(completedPhase).not.toBe(phaseState);
  });

  it('should preserve all other phase state properties', () => {
    const phaseState = {
      phase: CLEANUP_PHASE,
      step: 'firstPlayerResolveRally' as const,
      firstPlayerRallyResolutionState: {
        playerRallied: true,
        rallyResolved: false,
        unitsLostSupport: undefined,
        routState: undefined,
        completed: false,
      },
      secondPlayerRallyResolutionState: undefined,
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
