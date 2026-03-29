import type { StandardBoard, UnitWithPlacement } from '@entities';
import type { ResolveEngageRetreatOptionEvent } from '@events';
import type { GameState } from '@game';
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

import { applyResolveEngageRetreatOptionEvent } from './applyResolveEngageRetreatOptionEvent';

/**
 * Procedure output for front engagement: copies `defendingUnitCanRetreat` onto the nested
 * front engagement resolution state under the movement CRS.
 */
describe('applyResolveEngageRetreatOptionEvent', () => {
  /** Default front engagement factory with black engager speed 2 for retreat eligibility math. */
  function baseFrontEngagementState() {
    const front = createFrontEngagementState();
    return {
      ...front,
      engagingUnit: createUnitByStat('black', 'speed', 2),
    };
  }

  it('given front engagement and event defendingUnitCanRetreat true, movement slice stores true', () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const defender = createUnitByStat('white', 'speed', 3);
    const engagementState = baseFrontEngagementState();
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
    const full: GameState<StandardBoard> = updatePhaseState(
      withBoard,
      createIssueCommandsPhaseState(withBoard, {
        currentCommandResolutionState: movement,
      }),
    );

    const event = {
      eventNumber: 0,
      eventType: 'gameEffect' as const,
      effectType: 'resolveEngageRetreatOption' as const,
      defendingUnitCanRetreat: true,
    } satisfies ResolveEngageRetreatOptionEvent<StandardBoard>;

    const next = applyResolveEngageRetreatOptionEvent(event, full);
    const phase = next.currentRoundState.currentPhaseState;
    if (!phase || phase.phase !== 'issueCommands') {
      throw new Error('Expected issueCommands phase');
    }
    const cmd = phase.currentCommandResolutionState;
    if (cmd?.commandResolutionType !== 'movement') throw new Error('movement');
    const res = cmd.engagementState?.engagementResolutionState;
    if (res?.engagementType !== 'front') throw new Error('front');
    expect(res.defendingUnitCanRetreat).toBe(true);
  });
});
