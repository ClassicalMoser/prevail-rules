import type { GameState, StandardBoard, UnitWithPlacement } from '@entities';
import type { StartEngagementEvent } from '@events';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';

import { applyStartEngagementEvent } from './applyStartEngagementEvent';

describe('applyStartEngagementEvent', () => {
  function stateWithMovementToEnemy(): {
    state: GameState<StandardBoard>;
    defenderWithPlacement: UnitWithPlacement<StandardBoard>;
  } {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const defendingUnit = createTestUnit('white');
    const blackMover = createTestUnit('black');
    const defenderWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: defendingUnit,
      placement: { coordinate: 'E-6', facing: 'south' },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, defenderWithPlacement),
    };
    const movement = createMovementResolutionState(withBoard, {
      targetPlacement: { coordinate: 'E-6', facing: 'north' },
      movingUnit: {
        unit: blackMover,
        placement: { coordinate: 'E-5', facing: 'north' },
      },
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: movement,
    });
    return {
      state: updatePhaseState(withBoard, phase),
      defenderWithPlacement,
    };
  }

  it('creates front engagement using defenderWithPlacement from the event payload', () => {
    const { state, defenderWithPlacement } = stateWithMovementToEnemy();
    const event = {
      eventType: 'gameEffect' as const,
      effectType: 'startEngagement' as const,
      engagementType: 'front' as const,
      defenderWithPlacement,
    } satisfies StartEngagementEvent<StandardBoard>;

    const next = applyStartEngagementEvent(event, state);
    const phase = next.currentRoundState.currentPhaseState;
    if (!phase || phase.phase !== 'issueCommands') {
      throw new Error('Expected issueCommands phase');
    }
    const cmd = phase.currentCommandResolutionState;
    expect(cmd?.commandResolutionType).toBe('movement');
    if (cmd?.commandResolutionType !== 'movement') throw new Error('movement');
    expect(cmd.engagementState?.engagementResolutionState.engagementType).toBe(
      'front',
    );
    expect(cmd.engagementState?.engagingUnit).toBe(cmd.movingUnit.unit);
  });

  it('creates rear engagement rout for defending player from event.defenderWithPlacement', () => {
    const { state, defenderWithPlacement } = stateWithMovementToEnemy();
    const event = {
      eventType: 'gameEffect' as const,
      effectType: 'startEngagement' as const,
      engagementType: 'rear' as const,
      defenderWithPlacement,
    } satisfies StartEngagementEvent<StandardBoard>;

    const next = applyStartEngagementEvent(event, state);
    const phase = next.currentRoundState.currentPhaseState;
    if (!phase || phase.phase !== 'issueCommands') {
      throw new Error('Expected issueCommands phase');
    }
    const cmd = phase.currentCommandResolutionState;
    if (cmd?.commandResolutionType !== 'movement') throw new Error('movement');
    const res = cmd.engagementState?.engagementResolutionState;
    expect(res?.engagementType).toBe('rear');
    if (res?.engagementType !== 'rear') throw new Error('rear');
    expect(res.routState?.player).toBe(defenderWithPlacement.unit.playerSide);
  });
});
