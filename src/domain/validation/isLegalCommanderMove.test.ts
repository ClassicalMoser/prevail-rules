import type { StandardBoard, StandardBoardCoordinate } from '@entities';
import type { MoveCommanderEventForBoard } from '@events';
import { createBoardWithCommander } from '@testing';
import { createEmptyStandardBoard } from '@transforms';

import { isLegalCommanderMove } from './isLegalCommanderMove';

/**
 * Valid moves: Validates whether a commander move event is legal.
 */
describe('valid moves', () => {
  it('given commander moves within distance 1, returns true', () => {
    const board = createBoardWithCommander('black', 'E-5');
    const moveCommanderEvent: MoveCommanderEventForBoard<StandardBoard> = {
      boardType: 'standard',
      choiceType: 'moveCommander',
      eventNumber: 0,
      eventType: 'playerChoice',
      from: 'E-5',
      player: 'black',
      to: 'E-6', // Adjacent space
    };

    const { result } = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBeTruthy();
  });

  it('given commander moves within distance 4, returns true', () => {
    const board = createBoardWithCommander('black', 'E-5');
    const moveCommanderEvent: MoveCommanderEventForBoard<StandardBoard> = {
      boardType: 'standard',
      choiceType: 'moveCommander',
      eventNumber: 0,
      eventType: 'playerChoice',
      from: 'E-5',
      player: 'black',
      to: 'E-9', // Exactly 4 spaces away
    };

    const { result } = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBeTruthy();
  });

  it('given white commander moves within distance, returns true', () => {
    const board = createBoardWithCommander('white', 'F-6');
    const moveCommanderEvent: MoveCommanderEventForBoard<StandardBoard> = {
      boardType: 'standard',
      choiceType: 'moveCommander',
      eventNumber: 0,
      eventType: 'playerChoice',
      from: 'F-6',
      player: 'white',
      to: 'F-5', // Adjacent space
    };

    const { result } = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBeTruthy();
  });

  it('given commander moves diagonally within distance, returns true', () => {
    const board = createBoardWithCommander('black', 'E-5');
    const moveCommanderEvent: MoveCommanderEventForBoard<StandardBoard> = {
      boardType: 'standard',
      choiceType: 'moveCommander',
      eventNumber: 0,
      eventType: 'playerChoice',
      from: 'E-5',
      player: 'black',
      to: 'D-4', // Diagonal, distance 1
    };

    const { result } = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBeTruthy();
  });
});

describe('invalid moves', () => {
  it('given commander is not at starting position, returns false', () => {
    const board = createEmptyStandardBoard(); // No commander on board
    const moveCommanderEvent: MoveCommanderEventForBoard<StandardBoard> = {
      boardType: 'standard',
      choiceType: 'moveCommander',
      eventNumber: 0,
      eventType: 'playerChoice',
      from: 'E-5',
      player: 'black',
      to: 'E-6',
    };

    const { result } = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBeFalsy();
  });

  it("given wrong player's commander is at starting position, returns false", () => {
    const board = createBoardWithCommander('white', 'E-5'); // White commander, not black
    const moveCommanderEvent: MoveCommanderEventForBoard<StandardBoard> = {
      boardType: 'standard',
      choiceType: 'moveCommander',
      eventNumber: 0,
      eventType: 'playerChoice',
      from: 'E-5',
      player: 'black',
      to: 'E-6',
    };

    const { result } = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBeFalsy();
  });

  it('given destination is beyond move distance, returns false', () => {
    const board = createBoardWithCommander('black', 'E-5');
    const moveCommanderEvent: MoveCommanderEventForBoard<StandardBoard> = {
      boardType: 'standard',
      choiceType: 'moveCommander',
      eventNumber: 0,
      eventType: 'playerChoice',
      from: 'E-5',
      player: 'black',
      to: 'E-10', // 5 spaces away, beyond COMMANDER_MOVE_DISTANCE (4)
    };

    const { result } = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBeFalsy();
  });

  it('given starting coordinate is invalid, returns false', () => {
    const board = createEmptyStandardBoard();
    const moveCommanderEvent: MoveCommanderEventForBoard<StandardBoard> = {
      eventNumber: 0,
      eventType: 'playerChoice',
      choiceType: 'moveCommander',
      boardType: 'standard',
      player: 'black',
      from: 'Z-99' as StandardBoardCoordinate, // Invalid coordinate
      to: 'E-5',
    };

    const { result } = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBeFalsy();
  });

  it('given destination coordinate is invalid, returns false', () => {
    const board = createBoardWithCommander('black', 'E-5');
    const moveCommanderEvent: MoveCommanderEventForBoard<StandardBoard> = {
      boardType: 'standard',
      choiceType: 'moveCommander',
      eventNumber: 0,
      eventType: 'playerChoice',
      from: 'E-5',
      player: 'black',
      to: 'Z-99' as StandardBoardCoordinate, // Invalid coordinate
    };

    const { result } = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBeFalsy();
  });
});
