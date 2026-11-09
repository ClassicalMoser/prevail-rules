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
    it('a step straight ahead is a legal move', () => {
      const unitInstance = createTestUnit('black', { speed: 2 });
      const gameState = createEmptyGameState('standard');
      let board = gameState.boardState;
      board = addUnitToBoard(board, placed(unitInstance, 'E-5', 'north'));
      gameState.boardState = board;
      // One step into the faced space (§5.1.2–§5.1.3). The old case here
      // was a sidestep (E-5 to E-4, still facing north), which the 45°/180°
      // turn rule prices at four Flexibility — no longer a cheap move.
      const moveUnitEvent = createMoveUnitEvent({
        eventNumber: 0,
        moveCommander: false,
        player: 'black',
        to: createUnitPlacement('D-5', 'north'),
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
