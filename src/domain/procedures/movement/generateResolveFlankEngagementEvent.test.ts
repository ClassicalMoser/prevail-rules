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

/**
 * When a unit moves into a single enemy's space, it must engage.
 * From the flank, the defender is rotated to face the engager — in state that means
 * issueCommands + movement resolution with flank engagement on the defender's cell.
 * This procedure reads that state, snapshots the defender at the engagement target,
 * and sets newFacing to the opposite of the engaging facing on targetPlacement (not the defender's on-board facing).
 */
describe('generateResolveFlankEngagementEvent', () => {
  it('given flank engagement at default target with defender on that space, event snapshots defender placement and newFacing opposite engaging facing on targetPlacement', () => {
    // Baseline game state (testing helper supplies placeholder cards on inPlay).
    const state = createEmptyGameState();
    // createMovementResolutionState reads black.inPlay for commitment.card — required factory input, not part of this procedure's contract.
    state.cardState.black.inPlay = createTestCard();

    const defender = createTestUnit('white');
    const flank = createFlankEngagementState();
    // Factory default: targetPlacement E-5 facing north (engaging facing). If that default changes, expected newFacing below must change with it.
    const defenderPlacement: UnitWithPlacement<StandardBoard> = {
      unit: defender,
      placement: {
        coordinate: flank.targetPlacement.coordinate,
        facing: 'east',
      },
    };

    // Defender must occupy the engagement target cell so getSingleUnitWithPlacementAtCoordinate can resolve them.
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, defenderPlacement),
    };

    // Movement target and engagement target must agree — the procedure reads flank state from movement resolution.
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
    // Engaging facing north → defender rotates toward engager → opposite is south (independent of defender facing 'east' on the board).
    expect(event.newFacing).toBe('south');
  });
});
