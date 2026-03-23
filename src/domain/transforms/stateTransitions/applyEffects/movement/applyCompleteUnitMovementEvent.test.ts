import type { GameState, StandardBoard } from '@entities';
import type { CompleteUnitMovementEvent } from '@events';
import { getMovementResolutionState } from '@queries';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';

import { applyCompleteUnitMovementEvent } from './applyCompleteUnitMovementEvent';

describe('applyCompleteUnitMovementEvent', () => {
  it('marks movement resolution completed', () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const movement = createMovementResolutionState(state);
    const full: GameState<StandardBoard> = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
      }),
    );

    const event = {
      eventType: 'gameEffect' as const,
      effectType: 'completeUnitMovement' as const,
    } satisfies CompleteUnitMovementEvent<StandardBoard>;

    const next = applyCompleteUnitMovementEvent(event, full);
    const cmd = getMovementResolutionState(next);
    expect(cmd.completed).toBe(true);
  });
});
