import type { GameState, StandardBoard, UnitWithPlacement } from '@entities';
import {
  createEmptyGameState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createUnitByStat,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';

import { generateResolveEngageRetreatOptionEvent } from './generateResolveEngageRetreatOptionEvent';

function buildStateWithFrontEngagement(options: {
  defendingSpeed: number;
  engagingSpeed: number;
}): GameState<StandardBoard> {
  const state = createEmptyGameState();
  state.cardState.black.inPlay = createTestCard();
  const defender = createUnitByStat('white', 'speed', options.defendingSpeed);
  const front = createFrontEngagementState();
  const engagementState = {
    ...front,
    engagingUnit: createUnitByStat('black', 'speed', options.engagingSpeed),
  };
  const defenderWithPlacement: UnitWithPlacement<StandardBoard> = {
    unit: defender,
    placement: {
      coordinate: engagementState.targetPlacement.coordinate,
      facing: 'south',
    },
  };
  const withBoard = {
    ...state,
    boardState: addUnitToBoard(state.boardState, defenderWithPlacement),
  };
  const movement = createMovementResolutionState(withBoard, {
    targetPlacement: engagementState.targetPlacement,
    engagementState,
  });
  return updatePhaseState(
    withBoard,
    createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: movement,
    }),
  );
}

describe('generateResolveEngageRetreatOptionEvent', () => {
  it('is true when defender current speed exceeds engager speed', () => {
    const full = buildStateWithFrontEngagement({
      defendingSpeed: 4,
      engagingSpeed: 2,
    });
    const event = generateResolveEngageRetreatOptionEvent(full);
    expect(event.defendingUnitCanRetreat).toBe(true);
  });

  it('is false when defender current speed does not exceed engager speed', () => {
    const full = buildStateWithFrontEngagement({
      defendingSpeed: 2,
      engagingSpeed: 4,
    });
    const event = generateResolveEngageRetreatOptionEvent(full);
    expect(event.defendingUnitCanRetreat).toBe(false);
  });
});
