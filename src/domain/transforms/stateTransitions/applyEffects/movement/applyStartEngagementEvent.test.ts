import type {
  EngagementType,
  StandardBoard,
  UnitWithPlacement,
} from '@entities';
import type {
  StartEngagementEvent,
  StartEngagementEventForBoard,
} from '@events';
import type { GameStateForBoard } from '@game';
import { throwIfNone, throwIfPending } from '@utils';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';

import { applyStartEngagementEvent } from './applyStartEngagementEvent';

/**
 * When a move enters an enemy hex, this seeds `engagementState` on the movement CRS from the
 * procedure’s `engagementType` (front vs rear rout vs flank rotation pipeline).
 */
describe(applyStartEngagementEvent, () => {
  /** Black E-5 moving into white on E-6 with north-facing target placement. */
  function stateWithMovementToEnemy(): {
    state: GameStateForBoard<StandardBoard>;
    defenderWithPlacement: UnitWithPlacement<StandardBoard>;
  } {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const defendingUnit = createTestUnit('white');
    const blackMover = createTestUnit('black');
    const defenderWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-6',
        facing: 'south',
      },
      unit: defendingUnit,
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, defenderWithPlacement),
    };
    const movement = createMovementResolutionState(withBoard, {
      movingUnit: {
        boardType: 'standard' as const,
        placement: {
          boardType: 'standard' as const,
          coordinate: 'E-5',
          facing: 'north',
        },
        unit: blackMover,
      },
      targetPlacement: {
        boardType: 'standard' as const,
        coordinate: 'E-6',
        facing: 'north',
      },
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: movement,
    });
    return {
      defenderWithPlacement,
      state: updatePhaseState(withBoard, phase),
    };
  }

  it('given event engagementType front, movement engagement is front and engager is movingUnit', () => {
    const { state, defenderWithPlacement } = stateWithMovementToEnemy();
    const event: StartEngagementEvent = {
      boardType: 'standard' as const,
      defenderWithPlacement,
      effectType: 'startEngagement' as const,
      engagementType: 'front' as const,
      eventNumber: 0,
      eventType: 'gameEffect' as const,
    };

    const next = applyStartEngagementEvent(event, state);
    const phase = throwIfNone(
      next.currentRoundState.currentPhaseState,
      'phase',
    );
    if (phase.phase !== 'issueCommands') {
      throw new Error('Expected issueCommands phase');
    }
    const cmd = throwIfPending(phase.currentCommandResolutionState, 'command');
    expect(cmd.commandResolutionType).toBe('movement');
    if (cmd.commandResolutionType !== 'movement') {
      throw new Error('movement');
    }
    const engagement = throwIfPending(cmd.engagementState, 'engagement');
    expect(engagement.engagementResolutionState.engagementType).toBe('front');
    expect(engagement.engagingUnit).toBe(cmd.movingUnit.unit);
  });

  it('given event engagementType rear, rear routState player matches defender side', () => {
    const { state, defenderWithPlacement } = stateWithMovementToEnemy();
    const event: StartEngagementEvent = {
      boardType: 'standard' as const,
      defenderWithPlacement,
      effectType: 'startEngagement' as const,
      engagementType: 'rear' as const,
      eventNumber: 0,
      eventType: 'gameEffect' as const,
    };

    const next = applyStartEngagementEvent(event, state);
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
    expect(res.engagementType).toBe('rear');
    if (res.engagementType !== 'rear') {
      throw new Error('rear');
    }
    expect(throwIfPending(res.routState, 'rout').player).toBe(
      defenderWithPlacement.unit.playerSide,
    );
  });

  it('given event engagementType flank, flank substep present and defenderRotated false', () => {
    const { state, defenderWithPlacement } = stateWithMovementToEnemy();
    const event: StartEngagementEvent = {
      boardType: 'standard' as const,
      defenderWithPlacement,
      effectType: 'startEngagement' as const,
      engagementType: 'flank' as const,
      eventNumber: 0,
      eventType: 'gameEffect' as const,
    };

    const next = applyStartEngagementEvent(event, state);
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
    expect(res.engagementType).toBe('flank');
    if (res.engagementType !== 'flank') {
      throw new Error('flank');
    }
    expect(res.defenderRotated).toBeFalsy();
  });

  it('given bogus engagementType siege cast, throws unknown engagement type', () => {
    const { state, defenderWithPlacement } = stateWithMovementToEnemy();
    const event: StartEngagementEventForBoard<StandardBoard> = {
      eventNumber: 0,
      eventType: 'gameEffect' as const,
      effectType: 'startEngagement' as const,
      // Intentionally bad cast to test failure path
      engagementType: 'siege' as unknown as EngagementType,
      boardType: 'standard' as const,
      defenderWithPlacement,
    };

    expect(() => applyStartEngagementEvent(event, state)).toThrow(
      'Unknown engagement type: siege',
    );
  });
});
