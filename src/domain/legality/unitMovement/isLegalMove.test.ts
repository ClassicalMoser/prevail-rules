import type { MoveUnitEvent } from '@events';
import { createEmptyGameState, createTestUnit } from '@testing';
import { addUnitToBoard } from '@transforms';

import { isLegalMove } from './isLegalMove';

/**
 * IsLegalMove: Validates whether a unit move event is legal according to game rules.
 */
describe(isLegalMove, () => {
  describe('core functionality', () => {
    it('given a legal move, returns true', () => {
      const unitInstance = createTestUnit('black', { speed: 2 });
      const gameState = createEmptyGameState();
      let board = gameState.boardState;
      board = addUnitToBoard(board, {
        placement: {
          coordinate: 'E-5',
          facing: 'north',
        },
        unit: unitInstance,
      });
      gameState.boardState = board;
      const moveUnitEvent: MoveUnitEvent = {
        choiceType: 'moveUnit',
        eventNumber: 0,
        eventType: 'playerChoice',
        moveCommander: false,
        player: 'black',
        to: {
          coordinate: 'E-4',
          facing: 'north',
        },
        unit: {
          placement: {
            coordinate: 'E-5',
            facing: 'north',
          },
          unit: unitInstance,
        },
      };
      const isLegal = isLegalMove(moveUnitEvent, gameState);
      expect(isLegal).toBe(true);
    });
  });
  describe('bad inputs', () => {
    it('given a move that is not legal, returns false', () => {
      const unitInstance = createTestUnit('black', { speed: 2 });
      const gameState = createEmptyGameState();
      const moveUnitEvent: MoveUnitEvent = {
        choiceType: 'moveUnit',
        eventNumber: 0,
        eventType: 'playerChoice',
        moveCommander: false,
        player: 'black',
        to: {
          coordinate: 'E-6',
          facing: 'north',
        },
        unit: {
          placement: {
            coordinate: 'E-5',
            facing: 'north',
          },
          unit: unitInstance,
        },
      };
      const isLegal = isLegalMove(moveUnitEvent, gameState);
      expect(isLegal).toBe(false);
    });
  });
});
