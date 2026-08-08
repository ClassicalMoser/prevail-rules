import type { UnitWithPlacement } from '@entities';
import { throwIfNone, throwIfPending } from '@utils';
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

import { applyResolveEngageRetreatOptionEvent } from './applyResolveEngageRetreatOptionEvent';

/**
 * Procedure output for front engagement: copies `defendingUnitCanRetreat` onto the nested
 * front engagement resolution state under the movement CRS.
 */
describe(applyResolveEngageRetreatOptionEvent, () => {
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
    const defenderWithPlacement: UnitWithPlacement = {
      placement: {
        coordinate: engagementState.targetPlacement.coordinate,
        facing: 'south',
      },
      unit: defender,
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, defenderWithPlacement),
    };
    const movement = createMovementResolutionState(withBoard, {
      engagementState,
      targetPlacement: engagementState.targetPlacement,
    });
    const full: GameState = updatePhaseState(
      withBoard,
      createIssueCommandsPhaseState(withBoard, {
        currentCommandResolutionState: movement,
      }),
    );

    const event: ResolveEngageRetreatOptionEvent = {
      defendingUnitCanRetreat: true,
      effectType: 'resolveEngageRetreatOption' as const,
      eventNumber: 0,
      eventType: 'gameEffect' as const,
    };

    const next = applyResolveEngageRetreatOptionEvent(event, full);
    const phase = throwIfNone(
      next.currentRoundState.currentPhaseState,
      'phase',
    );
    if (phase.phase !== 'issueCommands') {
      throw new Error('Expected issueCommands phase');
    }
    const cmd = throwIfPending(phase.currentCommandResolutionState, 'command');
    if (cmd.commandResolutionType !== 'movement') {
      throw new Error('movement');
    }
    const engagement = throwIfPending(cmd.engagementState, 'engagement');
    const res = engagement.engagementResolutionState;
    if (res.engagementType !== 'front') {
      throw new Error('front');
    }
    expect(res.defendingUnitCanRetreat).toBe(true);
    expect(engagement.completed).toBe(false);
  });

  it('given defendingUnitCanRetreat false, marks front engagement complete (stay for melee)', () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const defender = createUnitByStat('white', 'speed', 2);
    const engagementState = {
      ...baseFrontEngagementState(),
      engagingUnit: createUnitByStat('black', 'speed', 4),
    };
    const defenderWithPlacement: UnitWithPlacement = {
      placement: {
        coordinate: engagementState.targetPlacement.coordinate,
        facing: 'south',
      },
      unit: defender,
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, defenderWithPlacement),
    };
    const movement = createMovementResolutionState(withBoard, {
      engagementState,
      targetPlacement: engagementState.targetPlacement,
    });
    const full: GameState = updatePhaseState(
      withBoard,
      createIssueCommandsPhaseState(withBoard, {
        currentCommandResolutionState: movement,
      }),
    );

    const next = applyResolveEngageRetreatOptionEvent(
      {
        defendingUnitCanRetreat: false,
        effectType: 'resolveEngageRetreatOption',
        eventNumber: 0,
        eventType: 'gameEffect',
      },
      full,
    );
    const phase = throwIfNone(
      next.currentRoundState.currentPhaseState,
      'phase',
    );
    if (phase.phase !== 'issueCommands') {
      throw new Error('Expected issueCommands phase');
    }
    const cmd = throwIfPending(phase.currentCommandResolutionState, 'command');
    if (cmd.commandResolutionType !== 'movement') {
      throw new Error('movement');
    }
    const engagement = throwIfPending(cmd.engagementState, 'engagement');
    expect(engagement.completed).toBe(true);
    if (engagement.engagementResolutionState.engagementType !== 'front') {
      throw new Error('front');
    }
    expect(engagement.engagementResolutionState.defendingUnitCanRetreat).toBe(
      false,
    );
  });
});
