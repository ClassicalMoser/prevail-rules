import type { UnitWithPlacement } from '@entities';
import type { GameState } from '@game';
import { createChooseMovingUnitEvent, createEmptyGameState } from '@factories';
import { getLegalMoveUnits } from '@legality';
import {
  getIssueCommandsPhaseState,
  getMovementResolutionState,
} from '@queries';
import {
  createIssueCommandsPhaseState,
  createTestCard,
  createUnitWithPlacement,
  updateCardState,
} from '@testing';
import {
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
  updateCurrentInitiative,
} from '@transforms/pureTransforms';
import { applyCompleteUnitMovementEvent } from '../applyEffects/movement/applyCompleteUnitMovementEvent';
import { applyMoveUnitEvent } from './applyMoveUnitEvent';

import { applyChooseMovingUnitEvent } from './applyChooseMovingUnitEvent';

/**
 * Naming a unit under a Move order begins its move (§4.3.10): a movement
 * opens with the commitment still to come and the move unwritten, and the
 * unit leaves the list of those the order has still to move.
 *
 * Black carries out a Move card for the given units, all on the board.
 */
function resolvingOrder(units: UnitWithPlacement[]): GameState {
  let state = updateCurrentInitiative(
    createEmptyGameState('standard'),
    'black',
  );
  state = updateCardState(state, {
    ...state.cardState,
    black: { ...state.cardState.black, inPlay: createTestCard() },
  });
  let board = state.boardState;
  for (const unit of units) {
    board = addUnitToBoard(board, unit);
  }
  state = updateBoardState(state, board);
  const resolving = updatePhaseState(
    state,
    createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: 'pending',
      remainingUnitsFirstPlayer: units.map((unit) => unit.unit),
      step: 'firstPlayerResolveCommands',
    }),
  );
  return resolving;
}

describe('applyChooseMovingUnitEvent function', () => {
  const first = createUnitWithPlacement({
    coordinate: 'E-5',
    facing: 'north',
    playerSide: 'black',
    unitOptions: { speed: 2 },
  });
  const second = createUnitWithPlacement({
    coordinate: 'E-3',
    facing: 'north',
    playerSide: 'black',
    unitOptions: { instanceNumber: 2, speed: 2 },
  });

  it('opens the move with the commitment owed and the move unwritten', () => {
    const state = resolvingOrder([first, second]);

    const named = applyChooseMovingUnitEvent(
      createChooseMovingUnitEvent({
        player: 'black',
        unit: first,
      }),
      state,
    );

    const movement = getMovementResolutionState(named);
    expect(movement.movingUnit).toStrictEqual(first);
    expect(movement.commitment).toStrictEqual({ commitmentType: 'pending' });
    expect(movement.targetPlacement).toBe('pending');
    expect(movement.moveCommander).toBe('pending');
  });

  it('takes the unit off the list the order has still to move', () => {
    const state = resolvingOrder([first, second]);

    const named = applyChooseMovingUnitEvent(
      createChooseMovingUnitEvent({
        player: 'black',
        unit: first,
      }),
      state,
    );

    expect(
      getIssueCommandsPhaseState(named).remainingUnitsFirstPlayer,
    ).toStrictEqual([second.unit]);
  });

  it('once its move is done, the unit is not offered again', () => {
    // Each unit moves once per order (§4.3.6).
    const state = resolvingOrder([first, second]);

    // Name the first unit, write its move (one step north), complete it.
    const named = applyChooseMovingUnitEvent(
      createChooseMovingUnitEvent({
        player: 'black',
        unit: first,
      }),
      state,
    );
    const moved = applyMoveUnitEvent(
      {
        choiceType: 'moveUnit',
        eventType: 'playerChoice',
        moveCommander: false,
        path: ['step'],
        player: 'black',
      },
      named,
    );
    const done = applyCompleteUnitMovementEvent(
      {
        effectType: 'completeUnitMovement',
        eventType: 'gameEffect',
      },
      moved,
    );

    expect(
      getLegalMoveUnits(done)?.units.map((unit) => unit.unit.instanceNumber),
    ).toStrictEqual([2]);
  });
});
