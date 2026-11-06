import { COMMANDER_MOVE_DISTANCE } from '@ruleValues';
import {
  createBoardWithCommander,
  createGameStateWithUnits,
  createTestUnit,
  placed,
} from '@testing';
import { addCommanderToBoard } from '@transforms';

import { exploreCommanderMoves } from './exploreCommanderMoves';

import { createEmptyGameState } from '@factories';
/**
 * ExploreCommanderMoves: BFS reachable commander coordinates within move distance with blocking rules.
 */
describe('exploreCommanderMoves function', () => {
  const maxDistance = COMMANDER_MOVE_DISTANCE;
  describe('core functionality', () => {
    it('given context, returns all moves on an empty board', () => {
      const playerSide = 'white';
      const startingCoordinate = 'E-5';
      const gameState = createEmptyGameState('standard');
      const legalMoves = exploreCommanderMoves(
        playerSide,
        startingCoordinate,
        gameState,
        maxDistance,
      );
      const squareLength = COMMANDER_MOVE_DISTANCE * 2 + 1;
      expect(legalMoves.size).toStrictEqual(squareLength * squareLength);
    });

    it('given work correctly near the board edge', () => {
      const playerSide = 'white';
      const startingCoordinate = 'E-2';
      const gameState = createEmptyGameState('standard');
      gameState.boardState = createBoardWithCommander(
        playerSide,
        startingCoordinate,
      );
      const legalMoves = exploreCommanderMoves(
        playerSide,
        startingCoordinate,
        gameState,
        maxDistance,
      );
      expect(legalMoves.size).toBe(54);
    });

    it('given work correctly in the corner of the board', () => {
      const playerSide = 'white';
      const startingCoordinate = 'A-1';
      const gameState = createEmptyGameState('standard');
      gameState.boardState = createBoardWithCommander(
        playerSide,
        startingCoordinate,
      );
      const legalMoves = exploreCommanderMoves(
        playerSide,
        startingCoordinate,
        gameState,
        maxDistance,
      );
      expect(legalMoves.size).toBe(25);
    });
  });
  describe('obstacle handling', () => {
    it('given not move into enemy spaces', () => {
      const enemyUnit1 = createTestUnit('black');
      const enemyUnit2 = createTestUnit('black');
      const enemyUnit3 = createTestUnit('black');
      const gameState = createGameStateWithUnits([
        placed(enemyUnit1, 'D-5', 'north'),
        placed(enemyUnit2, 'E-6', 'north'),
        placed(enemyUnit3, 'J-8', 'south'),
      ]);
      gameState.boardState = addCommanderToBoard(
        gameState.boardState,
        'white',
        'E-5',
      );
      const legalMoves = exploreCommanderMoves(
        'white',
        'E-5',
        gameState,
        maxDistance,
      );
      expect(legalMoves.has('D-5')).toBe(false);
      expect(legalMoves.has('E-6')).toBe(false);
      expect(legalMoves.has('J-8')).toBe(false);
    });

    it('given not move into engaged spaces', () => {
      const friendlyUnit1 = createTestUnit('white');
      const enemyUnit1 = createTestUnit('black');
      const friendlyUnit2 = createTestUnit('white');
      const enemyUnit2 = createTestUnit('black');
      const friendlyUnit3 = createTestUnit('white');
      const enemyUnit3 = createTestUnit('black');
      const gameState = createGameStateWithUnits([
        placed(friendlyUnit1, 'D-5', 'northEast'),
        placed(friendlyUnit2, 'E-6', 'north'),
        placed(friendlyUnit3, 'J-8', 'south'),
        placed(enemyUnit1, 'D-5', 'southWest'),
        placed(enemyUnit2, 'E-6', 'south'),
        placed(enemyUnit3, 'J-8', 'north'),
      ]);
      gameState.boardState = addCommanderToBoard(
        gameState.boardState,
        'white',
        'E-5',
      );
      const legalMoves = exploreCommanderMoves(
        'white',
        'E-5',
        gameState,
        maxDistance,
      );
      expect(legalMoves.has('D-5')).toBe(false);
      expect(legalMoves.has('E-6')).toBe(false);
      expect(legalMoves.has('J-8')).toBe(false);
    });

    it('given not move through a line of enemy units', () => {
      const enemyUnit1 = createTestUnit('black');
      const enemyUnit2 = createTestUnit('black');
      const enemyUnit3 = createTestUnit('black');
      const enemyUnit4 = createTestUnit('black');
      const enemyUnit5 = createTestUnit('black');
      const gameState = createGameStateWithUnits([
        placed(enemyUnit1, 'C-6', 'north'),
        placed(enemyUnit2, 'D-6', 'north'),
        placed(enemyUnit3, 'E-6', 'north'),
        placed(enemyUnit4, 'F-6', 'north'),
        placed(enemyUnit5, 'G-6', 'north'),
      ]);
      gameState.boardState = addCommanderToBoard(
        gameState.boardState,
        'white',
        'E-5',
      );
      const legalMoves = exploreCommanderMoves(
        'white',
        'E-5',
        gameState,
        3, // Smaller distance for this test
      );
      expect(legalMoves.has('C-6')).toBe(false);
      expect(legalMoves.has('D-6')).toBe(false);
      expect(legalMoves.has('E-6')).toBe(false);
      expect(legalMoves.has('F-6')).toBe(false);
      expect(legalMoves.has('G-6')).toBe(false);
      expect(legalMoves.has('C-7')).toBe(false);
      expect(legalMoves.has('D-7')).toBe(false);
      expect(legalMoves.has('E-7')).toBe(false);
      expect(legalMoves.has('F-7')).toBe(false);
      expect(legalMoves.has('G-7')).toBe(false);
    });

    it('given not move through a diagonal line of friendly units', () => {
      const friendlyUnit1 = createTestUnit('white');
      const friendlyUnit2 = createTestUnit('white');
      const friendlyUnit3 = createTestUnit('white');
      const friendlyUnit4 = createTestUnit('white');
      const friendlyUnit5 = createTestUnit('white');
      const friendlyUnit6 = createTestUnit('white');
      const friendlyUnit7 = createTestUnit('white');
      const friendlyUnit8 = createTestUnit('white');
      const gameState = createGameStateWithUnits([
        placed(friendlyUnit1, 'A-2', 'northEast'),
        placed(friendlyUnit2, 'B-3', 'northEast'),
        placed(friendlyUnit3, 'C-4', 'northEast'),
        placed(friendlyUnit4, 'D-5', 'northEast'),
        placed(friendlyUnit5, 'E-6', 'northEast'),
        placed(friendlyUnit6, 'F-7', 'northEast'),
        placed(friendlyUnit7, 'G-8', 'northEast'),
        placed(friendlyUnit8, 'H-9', 'northEast'),
      ]);
      gameState.boardState = addCommanderToBoard(
        gameState.boardState,
        'black',
        'E-5',
      );
      const legalMoves = exploreCommanderMoves(
        'black',
        'E-5',
        gameState,
        maxDistance,
      );
      expect(legalMoves.has('A-2')).toBe(false);
      expect(legalMoves.has('B-3')).toBe(false);
      expect(legalMoves.has('C-4')).toBe(false);
      expect(legalMoves.has('D-5')).toBe(false);
      expect(legalMoves.has('E-6')).toBe(false);
      expect(legalMoves.has('F-7')).toBe(false);
      expect(legalMoves.has('G-8')).toBe(false);
      expect(legalMoves.has('H-9')).toBe(false);
      expect(legalMoves.has('A-3')).toBe(false);
      expect(legalMoves.has('B-4')).toBe(false);
      expect(legalMoves.has('C-5')).toBe(false);
      expect(legalMoves.has('D-6')).toBe(false);
      expect(legalMoves.has('E-7')).toBe(false);
      expect(legalMoves.has('F-8')).toBe(false);
      expect(legalMoves.has('G-9')).toBe(false);
      expect(legalMoves.has('H-10')).toBe(false);
    });
  });
});
