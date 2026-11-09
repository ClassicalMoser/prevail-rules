import type { Commitment } from '@game';
import { PLAY_CARDS_PHASE } from '@game';
import { createEmptyGameState, createMoveUnitEvent } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
  createUnitWithPlacement,
} from '@testing';
import {
  addCommanderToBoard,
  addUnitToBoard,
  updateBoardState,
  updatePhaseState,
} from '@transforms';

import { isValidMoveUnitEvent } from './isValidMoveUnitEvent';

/**
 * The move for a unit already named, with its card committed or declined
 * (§4.3.10): a legal path, counting the card, and a rider only if the
 * commander stands with the unit.
 *
 * Black's Speed-2 unit stands on E-5 facing north, its move unwritten.
 */
function stateAwaitingMove(options?: {
  withCommander?: boolean;
  commitment?: Commitment;
}) {
  const mover = createUnitWithPlacement({
    coordinate: 'E-5',
    facing: 'north',
    playerSide: 'black',
    unitOptions: { speed: 2 },
  });
  let state = createEmptyGameState('standard');
  let board = addUnitToBoard(state.boardState, mover);
  if (options?.withCommander) {
    board = addCommanderToBoard(board, 'black', 'E-5');
  }
  state = updateBoardState(state, board);
  const movement = createMovementResolutionState(state, {
    commitment: options?.commitment ?? { commitmentType: 'declined' },
    moveCommander: 'pending',
    movingUnit: mover,
    targetPlacement: 'pending',
  });
  const awaiting = updatePhaseState(
    state,
    createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: movement,
    }),
  );
  return awaiting;
}

describe('isValidMoveUnitEvent function', () => {
  it('accepts a legal move without moving the commander', () => {
    const state = stateAwaitingMove();
    // One step straight ahead, from E-5 to D-5.
    const event = createMoveUnitEvent({
      eventNumber: 2,
      moveCommander: false,
      path: ['step'],
      player: 'black',
    });

    expect(isValidMoveUnitEvent(event, state)).toStrictEqual({ result: true });
  });

  it('counts a card committed for Speed toward the move', () => {
    // Three steps is one more than the unit's Speed of 2; the card adds it.
    const state = stateAwaitingMove({
      commitment: {
        card: createTestCard({ modifiers: ['speed'] }),
        commitmentType: 'completed',
      },
    });
    const event = createMoveUnitEvent({
      eventNumber: 2,
      moveCommander: false,
      path: ['step', 'step', 'step'],
      player: 'black',
    });

    expect(isValidMoveUnitEvent(event, state)).toStrictEqual({ result: true });
  });

  it('without a committed card, the longer move is refused', () => {
    const state = stateAwaitingMove();
    const event = createMoveUnitEvent({
      eventNumber: 2,
      moveCommander: false,
      path: ['step', 'step', 'step'],
      player: 'black',
    });

    expect(isValidMoveUnitEvent(event, state).result).toBe(false);
  });

  it('accepts a rider when the commander shares the unit space', () => {
    const state = stateAwaitingMove({ withCommander: true });
    const event = createMoveUnitEvent({
      eventNumber: 2,
      moveCommander: true,
      path: ['step'],
      player: 'black',
    });

    expect(isValidMoveUnitEvent(event, state)).toStrictEqual({ result: true });
  });

  it('refuses a rider when the commander stands elsewhere', () => {
    const state = stateAwaitingMove();
    const event = createMoveUnitEvent({
      eventNumber: 2,
      moveCommander: true,
      path: ['step'],
      player: 'black',
    });

    expect(isValidMoveUnitEvent(event, state).result).toBe(false);
  });

  it("refuses a move from the side whose unit it isn't", () => {
    const state = stateAwaitingMove();
    const event = createMoveUnitEvent({
      eventNumber: 2,
      moveCommander: false,
      path: ['step'],
      player: 'white',
    });

    expect(isValidMoveUnitEvent(event, state)).toStrictEqual({
      errorReason: 'Expected the move from black, got white',
      result: false,
    });
  });

  it('refuses a move when no unit is moving', () => {
    const state = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'chooseCards',
    });
    const event = createMoveUnitEvent({
      eventNumber: 0,
      moveCommander: false,
      path: ['step'],
      player: 'black',
    });

    expect(isValidMoveUnitEvent(event, state).result).toBe(false);
  });
});
