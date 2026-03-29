import type { StandardBoard, UnitFacing } from '@entities';
import type { GameState } from '@game';
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

/**
 * Start of engagement: from movement resolution, classify rear vs flank vs front from
 * defender facing on the board vs engaging facing on targetPlacement.
 * Geometry here: engager at E-5 facing east, defender at E-6 (adjacent east); facings vary per case.
 */
describe('generateStartEngagementEvent', () => {
  /** issueCommands + movement targeting E-6; black.inPlay satisfies movement factory commitment.card. */
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

  it('given movement into E-6, event copies defender unit and board facing at target coordinate', () => {
    const { full, defender } = stateEnteringDefenderAt({
      defenderFacing: 'south',
      engagingFacing: 'north',
    });

    const event = generateStartEngagementEvent(full, 0);
    expect(event.defenderWithPlacement.unit).toBe(defender);
    expect(event.defenderWithPlacement.placement.coordinate).toBe('E-6');
    expect(event.defenderWithPlacement.placement.facing).toBe('south');
    expect(['rear', 'flank', 'front']).toContain(event.engagementType);
  });

  it('given defender north and engaging north into rear arc, engagementType is rear', () => {
    const { full } = stateEnteringDefenderAt({
      defenderFacing: 'north',
      engagingFacing: 'north',
    });
    expect(generateStartEngagementEvent(full, 0).engagementType).toBe('rear');
  });

  it('given defender south and engaging east (orthogonal), engagementType is flank', () => {
    const { full } = stateEnteringDefenderAt({
      defenderFacing: 'south',
      engagingFacing: 'east',
    });
    expect(generateStartEngagementEvent(full, 0).engagementType).toBe('flank');
  });

  it('given defender south and engaging north (head-on), engagementType is front', () => {
    const { full } = stateEnteringDefenderAt({
      defenderFacing: 'south',
      engagingFacing: 'north',
    });
    expect(generateStartEngagementEvent(full, 0).engagementType).toBe('front');
  });

  it('given diagonal defender facing with engaging south, throws classification error', () => {
    const { full } = stateEnteringDefenderAt({
      defenderFacing: 'northEast',
      engagingFacing: 'south',
    });
    expect(() => generateStartEngagementEvent(full, 0)).toThrow(
      'Unable to determine engagement type. Engaging facing: south, Defending facing: northEast',
    );
  });
});
