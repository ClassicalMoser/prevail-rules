import { throwIfNone, throwIfPending } from '@utils';
import type { ResolveEngageRetreatOptionEvent } from '@events';
import type { GameState } from '@game';
import {
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createUnitByStat,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';

import { applyResolveEngageRetreatOptionEvent } from './applyResolveEngageRetreatOptionEvent';

import { createEmptyGameState } from '@factories';
/**
 * Procedure output for front engagement: records the retreats the defender may make on the
 * front engagement resolution state under the movement CRS. With none, the defender stands
 * and the engagement ends (§6.3.2).
 */
describe('applyResolveEngageRetreatOptionEvent function', () => {
  /** Default front engagement factory with black engager speed 2 for retreat eligibility math. */
  function baseFrontEngagementState() {
    const front = createFrontEngagementState();
    return {
      ...front,
      engagingUnit: createUnitByStat('black', 'speed', 2),
    };
  }

  it('records the retreats the defender may make, and leaves the engagement open', () => {
    const state = createEmptyGameState('standard');
    state.cardState.black.inPlay = createTestCard();
    const defender = createUnitByStat('white', 'speed', 3);
    const engagementState = baseFrontEngagementState();
    const defenderWithPlacement = placed(
      defender,
      engagementState.targetPlacement.coordinate,
      'south',
    );
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
      retreatPaths: [['step']],
      effectType: 'resolveEngageRetreatOption' as const,
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
    expect(res.retreatPaths).toStrictEqual([['step']]);
    expect(engagement.completed).toBe(false);
  });

  it('with no retreat to make, the defender stands and the engagement is complete', () => {
    const state = createEmptyGameState('standard');
    state.cardState.black.inPlay = createTestCard();
    const defender = createUnitByStat('white', 'speed', 2);
    const engagementState = {
      ...baseFrontEngagementState(),
      engagingUnit: createUnitByStat('black', 'speed', 4),
    };
    const defenderWithPlacement = placed(
      defender,
      engagementState.targetPlacement.coordinate,
      'south',
    );
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
        retreatPaths: [],
        effectType: 'resolveEngageRetreatOption',
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
    expect(engagement.engagementResolutionState.retreatPaths).toStrictEqual([]);
  });
});
