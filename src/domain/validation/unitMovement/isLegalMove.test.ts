import type { MoveUnitEvent } from '@events';
import { createEmptyGameState, createTestUnit } from '@testing';
import { addUnitToBoard } from '@transforms';
import { describe, expect, it } from 'vitest';
import { isLegalMove } from './isLegalMove';

describe('isLegalMove', () => {
  describe('core functionality', () => {
    it('should return true for a legal move', () => {
      const unit = createTestUnit('black', { speed: 2 });
      const gameState = createEmptyGameState();
      let board = gameState.boardState;
      board = addUnitToBoard(board, {
        unit,
        placement: { coordinate: 'E-5', facing: 'north' },
      });
      gameState.boardState = board;
      const moveUnitEvent: MoveUnitEvent = {
        eventType: 'playerChoice',
        choiceType: 'moveUnit',
        player: 'black',
        unit,
        from: { coordinate: 'E-5', facing: 'north' },
        to: { coordinate: 'E-4', facing: 'north' },
        moveCommander: false,
      };
      const isLegal = isLegalMove(moveUnitEvent, gameState);
      expect(isLegal).toBe(true);
    });
  });
  describe('bad inputs', () => {
    it('should return false for a move that is not legal', () => {
      const unit = createTestUnit('black', { speed: 2 });
      const gameState = createEmptyGameState();
      const moveUnitEvent: MoveUnitEvent = {
        eventType: 'playerChoice',
        choiceType: 'moveUnit',
        player: 'black',
        unit,
        from: { coordinate: 'E-5', facing: 'north' },
        to: { coordinate: 'E-6', facing: 'north' },
        moveCommander: false,
      };
      const isLegal = isLegalMove(moveUnitEvent, gameState);
      expect(isLegal).toBe(false);
    });
  });
});
