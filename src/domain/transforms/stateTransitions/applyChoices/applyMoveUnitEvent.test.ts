import type { UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import { createMoveUnitEvent, createEmptyGameState } from '@factories';
import { generateStartEngagementEvent } from '@procedures';
import { getMovementResolutionState } from '@queries';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createUnitWithPlacement,
} from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyMoveUnitEvent } from './applyMoveUnitEvent';

/**
 * The move is written into the movement its unit's `chooseMovingUnit`
 * opened, once any card has been committed (§4.3.10). Each case starts there:
 * the unit named, its commitment declined, its move not yet written.
 */
function awaitingMove(
  mover: UnitWithPlacement,
  others: UnitWithPlacement[] = [],
): GameState {
  let state = createEmptyGameState('standard');
  let board = addUnitToBoard(state.boardState, mover);
  for (const other of others) {
    board = addUnitToBoard(board, other);
  }
  state = updateBoardState(state, board);
  const movement = createMovementResolutionState(state, {
    commitment: { commitmentType: 'declined' },
    moveCommander: 'pending',
    movingUnit: mover,
    targetPlacement: 'pending',
  });
  const opened = updatePhaseState(
    state,
    createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: movement,
    }),
  );
  return opened;
}

describe('applyMoveUnitEvent function', () => {
  it('a move onto open ground carries the unit there and records where it went', () => {
    const mover = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const state = awaitingMove(mover);

    // From E-5: wheel right to east, two steps to E-7, wheel back to north.
    // The transform reads where the path leads; legality was settled before.
    const moved = applyMoveUnitEvent(
      createMoveUnitEvent({
        eventNumber: 2,
        moveCommander: false,
        path: [
          'turnRight',
          'turnRight',
          'step',
          'step',
          'turnLeft',
          'turnLeft',
        ],
        player: 'black',
      }),
      state,
    );

    expect(moved.boardState.board['E-5']?.unitPresence.presenceType).toBe(
      'none',
    );
    expect(moved.boardState.board['E-7']?.unitPresence).toMatchObject({
      facing: 'north',
      presenceType: 'single',
      unit: mover.unit,
    });
    const movement = getMovementResolutionState(moved);
    expect(movement.targetPlacement).toStrictEqual({
      coordinate: 'E-7',
      facing: 'north',
    });
    expect(movement.moveCommander).toBe(false);
  });

  it('a move into an enemy leaves the mover on its start space until the engagement', () => {
    // §5.1.4: the mover's stats were read where the move began, and it
    // waits there until the engagement places it.
    const engager = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { speed: 2 },
    });
    const defender = createUnitWithPlacement({
      coordinate: 'D-5',
      facing: 'south',
      playerSide: 'white',
    });
    const state = awaitingMove(engager, [defender]);

    // One step from E-5 into the enemy on D-5, already head-on.
    const moved = applyMoveUnitEvent(
      createMoveUnitEvent({
        eventNumber: 2,
        moveCommander: false,
        path: ['step'],
        player: 'black',
      }),
      state,
    );

    expect(moved.boardState.board['E-5']?.unitPresence).toMatchObject({
      presenceType: 'single',
      unit: engager.unit,
    });
    expect(moved.boardState.board['D-5']?.unitPresence).toMatchObject({
      presenceType: 'single',
      unit: defender.unit,
    });
    const movement = getMovementResolutionState(moved);
    expect(movement.movingUnit.placement).toStrictEqual(engager.placement);
    expect(movement.targetPlacement).toStrictEqual({
      coordinate: 'D-5',
      facing: 'north',
    });
    // The written move is what the engagement starts from.
    expect(generateStartEngagementEvent(moved, 3).engagementType).toBe('front');
  });

  it('records whether the commander rides along', () => {
    const mover = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    const state = awaitingMove(mover);

    const moved = applyMoveUnitEvent(
      createMoveUnitEvent({
        eventNumber: 2,
        moveCommander: true,
        path: ['step'],
        player: 'black',
      }),
      state,
    );

    expect(getMovementResolutionState(moved).moveCommander).toBe(true);
  });
});
