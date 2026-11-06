import { createTestUnit, placed } from '@testing';
import { addUnitToBoard } from '@transforms';

import { isLegalMove } from './isLegalMove';

import {
  createEmptyGameState,
  createMoveUnitEvent,
  createUnitPlacement,
} from '@factories';
/**
 * IsLegalMove: Validates whether a unit move event is legal according to game rules.
 */
describe('isLegalMove function', () => {
  describe('core functionality', () => {
    it('given a legal move, returns true', () => {
      const unitInstance = createTestUnit('black', { speed: 2 });
      const gameState = createEmptyGameState('standard');
      let board = gameState.boardState;
      board = addUnitToBoard(board, placed(unitInstance, 'E-5', 'north'));
      gameState.boardState = board;
      const moveUnitEvent = createMoveUnitEvent({
        eventNumber: 0,
        moveCommander: false,
        player: 'black',
        to: createUnitPlacement('E-4', 'north'),
        unit: placed(unitInstance, 'E-5', 'north'),
      });
      const isLegal = isLegalMove(moveUnitEvent, gameState);
      expect(isLegal).toBe(true);
    });
  });
  describe('bad inputs', () => {
    it('given a move that is not legal, returns false', () => {
      const unitInstance = createTestUnit('black', { speed: 2 });
      const gameState = createEmptyGameState('standard');
      const moveUnitEvent = createMoveUnitEvent({
        eventNumber: 0,
        moveCommander: false,
        player: 'black',
        to: createUnitPlacement('E-6', 'north'),
        unit: placed(unitInstance, 'E-5', 'north'),
      });
      const isLegal = isLegalMove(moveUnitEvent, gameState);
      expect(isLegal).toBe(false);
    });
  });
});
