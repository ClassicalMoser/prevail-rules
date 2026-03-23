import type { GameState, StandardBoard } from '@entities';
import type { CompleteRangedAttackCommandEvent } from '@events';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestCard,
} from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';

import { applyCompleteRangedAttackCommandEvent } from './applyCompleteRangedAttackCommandEvent';

describe('applyCompleteRangedAttackCommandEvent', () => {
  it('clears currentCommandResolutionState after ranged attack', () => {
    const base = createEmptyGameState();
    const withCards = updateCardState(base, (c) => ({
      ...c,
      white: { ...c.white, inPlay: createTestCard() },
      black: { ...c.black, inPlay: createTestCard() },
    }));
    const ranged = createRangedAttackResolutionState(withCards);
    const full: GameState<StandardBoard> = updatePhaseState(
      withCards,
      createIssueCommandsPhaseState(withCards, {
        currentCommandResolutionState: ranged,
      }),
    );

    const event = {
      eventType: 'gameEffect' as const,
      effectType: 'completeRangedAttackCommand' as const,
    } satisfies CompleteRangedAttackCommandEvent<StandardBoard>;

    const next = applyCompleteRangedAttackCommandEvent(event, full);
    const phase = next.currentRoundState.currentPhaseState;
    if (!phase || phase.phase !== 'issueCommands') throw new Error('issue');
    expect(phase.currentCommandResolutionState).toBeUndefined();
  });
});
