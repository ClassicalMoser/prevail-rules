import type { RearEngagementResolutionState } from '@entities';
import {
  createEmptyGameState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRearEngagementState,
  createRoutState,
  createTestCard,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';

import { getRoutStateFromRearEngagement } from './getRoutStateFromRearEngagement';

describe('getRoutStateFromRearEngagement', () => {
  it('returns rout state from rear engagement on movement resolution', () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const whiteUnit = createTestUnit('white');
    const routState = createRoutState('white', whiteUnit, {
      numberToDiscard: 2,
    });
    const movement = createMovementResolutionState(state, {
      engagementState: createRearEngagementState({ routState }),
    });
    const full = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
      }),
    );

    expect(getRoutStateFromRearEngagement(full)).toBe(routState);
  });

  it('throws when movement has no engagement state', () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const movement = createMovementResolutionState(state, {
      engagementState: undefined,
    });
    const full = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
      }),
    );

    expect(() => getRoutStateFromRearEngagement(full)).toThrow(
      'Movement resolution has no engagement state',
    );
  });

  it('throws when engagement is not rear', () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const movement = createMovementResolutionState(state, {
      engagementState: createFrontEngagementState(),
    });
    const full = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
      }),
    );

    expect(() => getRoutStateFromRearEngagement(full)).toThrow(
      'Expected rear engagement for movement rout, got front',
    );
  });

  it('throws when rear engagement omits rout state (malformed replay)', () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const rearBroken = {
      ...createRearEngagementState(),
      engagementResolutionState: {
        engagementType: 'rear' as const,
        completed: false,
      } as unknown as RearEngagementResolutionState,
    };
    const movement = createMovementResolutionState(state, {
      engagementState: rearBroken,
    });
    const full = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
      }),
    );

    expect(() => getRoutStateFromRearEngagement(full)).toThrow(
      'Rear engagement has no rout state',
    );
  });
});
