import type { GameState, StandardBoard, UnitFacing } from '@entities';
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
  function stateEnteringDefenderAt(options: {
    defenderFacing: UnitFacing;
    engagingFacing: UnitFacing;
  }): {
    full: GameState<StandardBoard>;
    defender: ReturnType<typeof createTestUnit>;
  } {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const defender = createTestUnit('white');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, {
        unit: defender,
        placement: { coordinate: 'E-6', facing: options.defenderFacing },
      }),
    };
    const movement = createMovementResolutionState(withBoard, {
      targetPlacement: {
        coordinate: 'E-6',
        facing: options.engagingFacing,
      },
      movingUnit: {
        unit: createTestUnit('black'),
        placement: { coordinate: 'E-5', facing: 'east' },
      },
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: movement,
    });
    const full = updatePhaseState(withBoard, phase);
    return { full, defender };
  }

  it('includes defenderWithPlacement (unit + coordinate + facing) at the movement target', () => {
    const { full, defender } = stateEnteringDefenderAt({
      defenderFacing: 'south',
      engagingFacing: 'north',
    });

    const event = generateStartEngagementEvent(full);
    expect(event.defenderWithPlacement.unit).toBe(defender);
    expect(event.defenderWithPlacement.placement.coordinate).toBe('E-6');
    expect(event.defenderWithPlacement.placement.facing).toBe('south');
    expect(['rear', 'flank', 'front']).toContain(event.engagementType);
  });

  it('classifies rear engagement when engaging facing matches defender rear arc', () => {
    const { full } = stateEnteringDefenderAt({
      defenderFacing: 'north',
      engagingFacing: 'north',
    });
    expect(generateStartEngagementEvent(full).engagementType).toBe('rear');
  });

  it('classifies flank engagement when engaging facing is orthogonal to defender', () => {
    const { full } = stateEnteringDefenderAt({
      defenderFacing: 'south',
      engagingFacing: 'east',
    });
    expect(generateStartEngagementEvent(full).engagementType).toBe('flank');
  });

  it('classifies front engagement when engaging facing opposes defender', () => {
    const { full } = stateEnteringDefenderAt({
      defenderFacing: 'south',
      engagingFacing: 'north',
    });
    expect(generateStartEngagementEvent(full).engagementType).toBe('front');
  });

  it('throws when facings do not map to rear, flank, or front', () => {
    const { full } = stateEnteringDefenderAt({
      defenderFacing: 'northEast',
      engagingFacing: 'south',
    });
    expect(() => generateStartEngagementEvent(full)).toThrow(
      'Unable to determine engagement type. Engaging facing: south, Defending facing: northEast',
    );
  });
});
