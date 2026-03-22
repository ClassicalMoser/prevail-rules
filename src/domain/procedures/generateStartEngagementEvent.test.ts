import type { GameState, StandardBoard } from '@entities';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';

import { generateStartEngagementEvent } from './generateStartEngagementEvent';

describe('generateStartEngagementEvent', () => {
  it('includes defenderWithPlacement (unit + coordinate + facing) at the movement target', () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const defender = createTestUnit('white');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, {
        unit: defender,
        placement: { coordinate: 'E-6', facing: 'south' },
      }),
    };
    const movement = createMovementResolutionState(withBoard, {
      targetPlacement: { coordinate: 'E-6', facing: 'north' },
      movingUnit: {
        unit: createTestUnit('black'),
        placement: { coordinate: 'E-5', facing: 'east' },
      },
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: movement,
    });
    const full: GameState<StandardBoard> = updatePhaseState(withBoard, phase);

    const event = generateStartEngagementEvent(full);
    expect(event.defenderWithPlacement.unit).toBe(defender);
    expect(event.defenderWithPlacement.placement.coordinate).toBe('E-6');
    expect(event.defenderWithPlacement.placement.facing).toBe('south');
    expect(['rear', 'flank', 'front']).toContain(event.engagementType);
  });
});
