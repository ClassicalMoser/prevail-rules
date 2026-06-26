import type { CompleteRangedAttackCommandEvent } from '@events';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestCard,
  updateCardState,
} from '@testing';
import type { StandardBoard } from '@entities';
import type { GameStateForBoard } from '@game';
import { updatePhaseState } from '@transforms/pureTransforms';

import { applyCompleteRangedAttackCommandEvent } from './applyCompleteRangedAttackCommandEvent';

/**
 * Ranged command fully finished (including apply substeps): clears `currentCommandResolutionState`
 * so the issuing player can continue down their remaining-units queue.
 */
describe(applyCompleteRangedAttackCommandEvent, () => {
  it('given issueCommands holding ranged CRS, after effect currentCommandResolutionState is undefined', () => {
    const base = createEmptyGameState();
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inPlay: createTestCard() },
      white: { ...base.cardState.white, inPlay: createTestCard() },
    });
    const ranged = createRangedAttackResolutionState(withCards);
    const full: GameStateForBoard<StandardBoard> = updatePhaseState(
      withCards,
      createIssueCommandsPhaseState(withCards, {
        currentCommandResolutionState: ranged,
      }),
    );

    const event = {
      effectType: 'completeRangedAttackCommand' as const,
      eventNumber: 0,
      eventType: 'gameEffect' as const,
    } satisfies CompleteRangedAttackCommandEvent;

    const next = applyCompleteRangedAttackCommandEvent(event, full);
    const phase = next.currentRoundState.currentPhaseState;
    if (phase === 'none' || phase.phase !== 'issueCommands') {
      throw new Error('issue');
    }
    expect(phase.currentCommandResolutionState).toBe('pending');
  });
});
