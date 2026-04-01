import type { StandardBoard, UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import {
  createEmptyGameState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createUnitByStat,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';

import { generateResolveEngageRetreatOptionEvent } from './generateResolveEngageRetreatOptionEvent';

/**
 * Minimal front-engagement stack: defender on `createFrontEngagementState` default cell (E-5),
 * engager speeds swapped via createUnitByStat; black.inPlay only feeds movement commitment factory.
 */
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
    boardType: 'standard' as const,
    unit: defender,
    placement: {
      boardType: 'standard' as const,
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

/**
 * Front engagement: defendingUnitCanRetreat is true iff defender’s current speed exceeds
 * engager’s (see procedure). black.inPlay only satisfies movement factory commitment.
 */
describe('generateResolveEngageRetreatOptionEvent', () => {
  it('given defender speed 4 and engager speed 2, defendingUnitCanRetreat is true', () => {
    const full = buildStateWithFrontEngagement({
      defendingSpeed: 4,
      engagingSpeed: 2,
    });
    const event = generateResolveEngageRetreatOptionEvent(full, 0);
    expect(event.defendingUnitCanRetreat).toBe(true);
  });

  it('given defender speed 2 and engager speed 4, defendingUnitCanRetreat is false', () => {
    const full = buildStateWithFrontEngagement({
      defendingSpeed: 2,
      engagingSpeed: 4,
    });
    const event = generateResolveEngageRetreatOptionEvent(full, 0);
    expect(event.defendingUnitCanRetreat).toBe(false);
  });
});
