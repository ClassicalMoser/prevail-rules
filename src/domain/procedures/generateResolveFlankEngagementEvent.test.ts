import type { GameState, StandardBoard, UnitWithPlacement } from '@entities';
import {
  createEmptyGameState,
  createFlankEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';

import { generateResolveFlankEngagementEvent } from './generateResolveFlankEngagementEvent';

describe('generateResolveFlankEngagementEvent', () => {
  it('returns defenderWithPlacement at the engagement target and opposite engaging facing', () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const defender = createTestUnit('white');
    const flank = createFlankEngagementState();
    const defenderPlacement: UnitWithPlacement<StandardBoard> = {
      unit: defender,
      placement: {
        coordinate: flank.targetPlacement.coordinate,
        facing: 'east',
      },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, defenderPlacement),
    };
    const movement = createMovementResolutionState(withBoard, {
      targetPlacement: flank.targetPlacement,
      engagementState: flank,
    });
    const full: GameState<StandardBoard> = updatePhaseState(
      withBoard,
      createIssueCommandsPhaseState(withBoard, {
        currentCommandResolutionState: movement,
      }),
    );

    const event = generateResolveFlankEngagementEvent(full);
    expect(event.defenderWithPlacement.unit).toBe(defender);
    expect(event.defenderWithPlacement.placement).toEqual(
      defenderPlacement.placement,
    );
    expect(event.newFacing).toBe('south');
  });
});
