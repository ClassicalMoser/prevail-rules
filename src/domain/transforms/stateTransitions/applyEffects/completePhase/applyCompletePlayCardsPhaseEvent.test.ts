import type { GameState, StandardBoard } from '@entities';
import type { CompletePlayCardsPhaseEvent } from '@events';
import { MOVE_COMMANDERS_PHASE, PLAY_CARDS_PHASE } from '@entities';
import { createEmptyGameState, createPlayCardsPhaseState } from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';

import { applyCompletePlayCardsPhaseEvent } from './applyCompletePlayCardsPhaseEvent';

describe('applyCompletePlayCardsPhaseEvent', () => {
  it('records completed playCards phase and advances to move commanders', () => {
    const state = createEmptyGameState();
    const full: GameState<StandardBoard> = updatePhaseState(
      state,
      createPlayCardsPhaseState({ step: 'complete' }),
    );

    const event = {
      eventType: 'gameEffect' as const,
      effectType: 'completePlayCardsPhase' as const,
    } satisfies CompletePlayCardsPhaseEvent<StandardBoard>;

    const next = applyCompletePlayCardsPhaseEvent(event, full);
    const phase = next.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe(MOVE_COMMANDERS_PHASE);
    expect(phase?.step).toBe('moveFirstCommander');
    const completed = [...next.currentRoundState.completedPhases];
    expect(completed).toHaveLength(1);
    expect(completed[0]?.phase).toBe(PLAY_CARDS_PHASE);
  });
});
