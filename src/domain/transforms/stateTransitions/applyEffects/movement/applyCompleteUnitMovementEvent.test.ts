import type { StandardBoard } from '@entities';
import type { CompleteUnitMovementEvent } from '@events';
import type { GameState } from '@game';
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

/**
 * After the moving unit’s path and any engagement substeps finish, this flips the movement
 * command resolution slice to `completed` so issue-commands can advance.
 */
describe('applyCompleteUnitMovementEvent', () => {
  it('given issueCommands with active movement CRS, movement.completed becomes true', () => {
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
      eventNumber: 0,
      eventType: 'gameEffect' as const,
      effectType: 'completeUnitMovement' as const,
    } satisfies CompleteUnitMovementEvent<StandardBoard>;

    const next = applyCompleteUnitMovementEvent(event, full);
    const cmd = getMovementResolutionState(next);
    expect(cmd.completed).toBe(true);
  });
});
