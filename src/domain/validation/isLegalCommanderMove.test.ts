import type { StandardBoardCoordinate } from '@entities';
import type { MoveCommanderEvent } from '@events';
import { createBoardWithCommander } from '@testing';
import { createEmptyStandardBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { isLegalCommanderMove } from './isLegalCommanderMove';

describe('valid moves', () => {
  it('should return true when commander moves within distance 1', () => {
    const board = createBoardWithCommander('black', 'E-5');
    const moveCommanderEvent: MoveCommanderEvent = {
      eventType: 'playerChoice',
      choiceType: 'moveCommander',
      player: 'black',
      from: 'E-5',
      to: 'E-6', // Adjacent space
    };

    const result = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBe(true);
  });

  it('should return true when commander moves within distance 4', () => {
    const board = createBoardWithCommander('black', 'E-5');
    const moveCommanderEvent: MoveCommanderEvent = {
      eventType: 'playerChoice',
      choiceType: 'moveCommander',
      player: 'black',
      from: 'E-5',
      to: 'E-9', // Exactly 4 spaces away
    };

    const result = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBe(true);
  });

  it('should return true when white commander moves within distance', () => {
    const board = createBoardWithCommander('white', 'F-6');
    const moveCommanderEvent: MoveCommanderEvent = {
      eventType: 'playerChoice',
      choiceType: 'moveCommander',
      player: 'white',
      from: 'F-6',
      to: 'F-5', // Adjacent space
    };

    const result = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBe(true);
  });

  it('should return true when commander moves diagonally within distance', () => {
    const board = createBoardWithCommander('black', 'E-5');
    const moveCommanderEvent: MoveCommanderEvent = {
      eventType: 'playerChoice',
      choiceType: 'moveCommander',
      player: 'black',
      from: 'E-5',
      to: 'D-4', // Diagonal, distance 1
    };

    const result = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBe(true);
  });
});

describe('invalid moves', () => {
  it('should return false when commander is not at starting position', () => {
    const board = createEmptyStandardBoard(); // No commander on board
    const moveCommanderEvent: MoveCommanderEvent = {
      eventType: 'playerChoice',
      choiceType: 'moveCommander',
      player: 'black',
      from: 'E-5',
      to: 'E-6',
    };

    const result = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBe(false);
  });

  it("should return false when wrong player's commander is at starting position", () => {
    const board = createBoardWithCommander('white', 'E-5'); // White commander, not black
    const moveCommanderEvent: MoveCommanderEvent = {
      eventType: 'playerChoice',
      choiceType: 'moveCommander',
      player: 'black',
      from: 'E-5',
      to: 'E-6',
    };

    const result = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBe(false);
  });

  it('should return false when destination is beyond move distance', () => {
    const board = createBoardWithCommander('black', 'E-5');
    const moveCommanderEvent: MoveCommanderEvent = {
      eventType: 'playerChoice',
      choiceType: 'moveCommander',
      player: 'black',
      from: 'E-5',
      to: 'E-10', // 5 spaces away, beyond COMMANDER_MOVE_DISTANCE (4)
    };

    const result = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBe(false);
  });

  it('should return false when starting coordinate is invalid', () => {
    const board = createEmptyStandardBoard();
    const moveCommanderEvent: MoveCommanderEvent = {
      eventType: 'playerChoice',
      choiceType: 'moveCommander',
      player: 'black',
      from: 'Z-99' as StandardBoardCoordinate, // Invalid coordinate
      to: 'E-5',
    };

    const result = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBe(false);
  });

  it('should return false when destination coordinate is invalid', () => {
    const board = createBoardWithCommander('black', 'E-5');
    const moveCommanderEvent: MoveCommanderEvent = {
      eventType: 'playerChoice',
      choiceType: 'moveCommander',
      player: 'black',
      from: 'E-5',
      to: 'Z-99' as StandardBoardCoordinate, // Invalid coordinate
    };

    const result = isLegalCommanderMove(moveCommanderEvent, board);

    expect(result).toBe(false);
  });
});
