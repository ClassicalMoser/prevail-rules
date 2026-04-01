import type { StandardBoard, StandardBoardCoordinate } from '@entities';
import type { MoveCommanderEvent } from '@events';
import { createBoardWithCommander } from '@testing';
import { createEmptyStandardBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { isLegalCommanderMove } from './isLegalCommanderMove';

/**
 * valid moves: Validates whether a commander move event is legal.
 */
describe('valid moves', () => {
  it('given commander moves within distance 1, returns true', () => {
    const board = createBoardWithCommander('black', 'E-5');
    const moveCommanderEvent: MoveCommanderEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: 'playerChoice',
      choiceType: 'moveCommander',
      boardType: 'standard',
      player: 'black',
      from: 'E-5',
      to: 'E-6', // Adjacent space
    };

    const { result } = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBe(true);
  });

  it('given commander moves within distance 4, returns true', () => {
    const board = createBoardWithCommander('black', 'E-5');
    const moveCommanderEvent: MoveCommanderEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: 'playerChoice',
      choiceType: 'moveCommander',
      boardType: 'standard',
      player: 'black',
      from: 'E-5',
      to: 'E-9', // Exactly 4 spaces away
    };

    const { result } = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBe(true);
  });

  it('given white commander moves within distance, returns true', () => {
    const board = createBoardWithCommander('white', 'F-6');
    const moveCommanderEvent: MoveCommanderEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: 'playerChoice',
      choiceType: 'moveCommander',
      boardType: 'standard',
      player: 'white',
      from: 'F-6',
      to: 'F-5', // Adjacent space
    };

    const { result } = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBe(true);
  });

  it('given commander moves diagonally within distance, returns true', () => {
    const board = createBoardWithCommander('black', 'E-5');
    const moveCommanderEvent: MoveCommanderEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: 'playerChoice',
      choiceType: 'moveCommander',
      boardType: 'standard',
      player: 'black',
      from: 'E-5',
      to: 'D-4', // Diagonal, distance 1
    };

    const { result } = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBe(true);
  });
});

describe('invalid moves', () => {
  it('given commander is not at starting position, returns false', () => {
    const board = createEmptyStandardBoard(); // No commander on board
    const moveCommanderEvent: MoveCommanderEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: 'playerChoice',
      choiceType: 'moveCommander',
      boardType: 'standard',
      player: 'black',
      from: 'E-5',
      to: 'E-6',
    };

    const { result } = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBe(false);
  });

  it("given wrong player's commander is at starting position, returns false", () => {
    const board = createBoardWithCommander('white', 'E-5'); // White commander, not black
    const moveCommanderEvent: MoveCommanderEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: 'playerChoice',
      choiceType: 'moveCommander',
      boardType: 'standard',
      player: 'black',
      from: 'E-5',
      to: 'E-6',
    };

    const { result } = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBe(false);
  });

  it('given destination is beyond move distance, returns false', () => {
    const board = createBoardWithCommander('black', 'E-5');
    const moveCommanderEvent: MoveCommanderEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: 'playerChoice',
      choiceType: 'moveCommander',
      boardType: 'standard',
      player: 'black',
      from: 'E-5',
      to: 'E-10', // 5 spaces away, beyond COMMANDER_MOVE_DISTANCE (4)
    };

    const { result } = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBe(false);
  });

  it('given starting coordinate is invalid, returns false', () => {
    const board = createEmptyStandardBoard();
    const moveCommanderEvent: MoveCommanderEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: 'playerChoice',
      choiceType: 'moveCommander',
      boardType: 'standard',
      player: 'black',
      from: 'Z-99' as StandardBoardCoordinate, // Invalid coordinate
      to: 'E-5',
    };

    const { result } = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBe(false);
  });

  it('given destination coordinate is invalid, returns false', () => {
    const board = createBoardWithCommander('black', 'E-5');
    const moveCommanderEvent: MoveCommanderEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: 'playerChoice',
      choiceType: 'moveCommander',
      boardType: 'standard',
      player: 'black',
      from: 'E-5',
      to: 'Z-99' as StandardBoardCoordinate, // Invalid coordinate
    };

    const { result } = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBe(false);
  });
});
