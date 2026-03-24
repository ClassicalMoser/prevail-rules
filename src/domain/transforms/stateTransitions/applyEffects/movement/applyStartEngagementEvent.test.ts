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

/**
 * When a move enters an enemy hex, this seeds `engagementState` on the movement CRS from the
 * procedure’s `engagementType` (front vs rear rout vs flank rotation pipeline).
 */
describe('applyStartEngagementEvent', () => {
  /** Black E-5 moving into white on E-6 with north-facing target placement. */
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

  it('given event engagementType front, movement engagement is front and engager is movingUnit', () => {
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

  it('given event engagementType rear, rear routState player matches defender side', () => {
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

  it('given event engagementType flank, flank substep present and defenderRotated false', () => {
    const { state, defenderWithPlacement } = stateWithMovementToEnemy();
    const event = {
      eventType: 'gameEffect' as const,
      effectType: 'startEngagement' as const,
      engagementType: 'flank' as const,
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
    expect(res?.engagementType).toBe('flank');
    if (res?.engagementType !== 'flank') throw new Error('flank');
    expect(res.defenderRotated).toBe(false);
  });

  it('given bogus engagementType siege cast, throws unknown engagement type', () => {
    const { state, defenderWithPlacement } = stateWithMovementToEnemy();
    const event = {
      eventType: 'gameEffect' as const,
      effectType: 'startEngagement' as const,
      engagementType: 'siege' as const,
      defenderWithPlacement,
    } as unknown as StartEngagementEvent<StandardBoard>;

    expect(() => applyStartEngagementEvent(event, state)).toThrow(
      'Unknown engagement type: siege',
    );
  });
});
