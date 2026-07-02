import { COMMANDER_MOVE_DISTANCE } from '@ruleValues';
import {
  createBoardWithCommander,
  createEmptyGameState,
  createGameStateWithUnits,
  createTestUnit,
} from '@testing';
import { addCommanderToBoard } from '@transforms';

import { exploreCommanderMoves } from './exploreCommanderMoves';

/**
 * ExploreCommanderMoves: BFS reachable commander coordinates within move distance with blocking rules.
 */
describe(exploreCommanderMoves, () => {
  const maxDistance = COMMANDER_MOVE_DISTANCE;
  describe('core functionality', () => {
    it('given context, returns all moves on an empty board', () => {
      const playerSide = 'white';
      const startingCoordinate = 'E-5';
      const gameState = createEmptyGameState();
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
      const gameState = createEmptyGameState();
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
      const gameState = createEmptyGameState();
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
        { coordinate: 'D-5', facing: 'north', unit: enemyUnit1 },
        { coordinate: 'E-6', facing: 'north', unit: enemyUnit2 },
        { coordinate: 'J-8', facing: 'south', unit: enemyUnit3 },
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
      expect(legalMoves.has('D-5')).toBeFalsy();
      expect(legalMoves.has('E-6')).toBeFalsy();
      expect(legalMoves.has('J-8')).toBeFalsy();
    });

    it('given not move into engaged spaces', () => {
      const friendlyUnit1 = createTestUnit('white');
      const enemyUnit1 = createTestUnit('black');
      const friendlyUnit2 = createTestUnit('white');
      const enemyUnit2 = createTestUnit('black');
      const friendlyUnit3 = createTestUnit('white');
      const enemyUnit3 = createTestUnit('black');
      const gameState = createGameStateWithUnits([
        { coordinate: 'D-5', facing: 'northEast', unit: friendlyUnit1 },
        { coordinate: 'E-6', facing: 'north', unit: friendlyUnit2 },
        { coordinate: 'J-8', facing: 'south', unit: friendlyUnit3 },
        { coordinate: 'D-5', facing: 'southWest', unit: enemyUnit1 },
        { coordinate: 'E-6', facing: 'south', unit: enemyUnit2 },
        { coordinate: 'J-8', facing: 'north', unit: enemyUnit3 },
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
      expect(legalMoves.has('D-5')).toBeFalsy();
      expect(legalMoves.has('E-6')).toBeFalsy();
      expect(legalMoves.has('J-8')).toBeFalsy();
    });

    it('given not move through a line of enemy units', () => {
      const enemyUnit1 = createTestUnit('black');
      const enemyUnit2 = createTestUnit('black');
      const enemyUnit3 = createTestUnit('black');
      const enemyUnit4 = createTestUnit('black');
      const enemyUnit5 = createTestUnit('black');
      const gameState = createGameStateWithUnits([
        { coordinate: 'C-6', facing: 'north', unit: enemyUnit1 },
        { coordinate: 'D-6', facing: 'north', unit: enemyUnit2 },
        { coordinate: 'E-6', facing: 'north', unit: enemyUnit3 },
        { coordinate: 'F-6', facing: 'north', unit: enemyUnit4 },
        { coordinate: 'G-6', facing: 'north', unit: enemyUnit5 },
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
      expect(legalMoves.has('C-6')).toBeFalsy();
      expect(legalMoves.has('D-6')).toBeFalsy();
      expect(legalMoves.has('E-6')).toBeFalsy();
      expect(legalMoves.has('F-6')).toBeFalsy();
      expect(legalMoves.has('G-6')).toBeFalsy();
      expect(legalMoves.has('C-7')).toBeFalsy();
      expect(legalMoves.has('D-7')).toBeFalsy();
      expect(legalMoves.has('E-7')).toBeFalsy();
      expect(legalMoves.has('F-7')).toBeFalsy();
      expect(legalMoves.has('G-7')).toBeFalsy();
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
        { coordinate: 'A-2', facing: 'northEast', unit: friendlyUnit1 },
        { coordinate: 'B-3', facing: 'northEast', unit: friendlyUnit2 },
        { coordinate: 'C-4', facing: 'northEast', unit: friendlyUnit3 },
        { coordinate: 'D-5', facing: 'northEast', unit: friendlyUnit4 },
        { coordinate: 'E-6', facing: 'northEast', unit: friendlyUnit5 },
        { coordinate: 'F-7', facing: 'northEast', unit: friendlyUnit6 },
        { coordinate: 'G-8', facing: 'northEast', unit: friendlyUnit7 },
        { coordinate: 'H-9', facing: 'northEast', unit: friendlyUnit8 },
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
      expect(legalMoves.has('A-2')).toBeFalsy();
      expect(legalMoves.has('B-3')).toBeFalsy();
      expect(legalMoves.has('C-4')).toBeFalsy();
      expect(legalMoves.has('D-5')).toBeFalsy();
      expect(legalMoves.has('E-6')).toBeFalsy();
      expect(legalMoves.has('F-7')).toBeFalsy();
      expect(legalMoves.has('G-8')).toBeFalsy();
      expect(legalMoves.has('H-9')).toBeFalsy();
      expect(legalMoves.has('A-3')).toBeFalsy();
      expect(legalMoves.has('B-4')).toBeFalsy();
      expect(legalMoves.has('C-5')).toBeFalsy();
      expect(legalMoves.has('D-6')).toBeFalsy();
      expect(legalMoves.has('E-7')).toBeFalsy();
      expect(legalMoves.has('F-8')).toBeFalsy();
      expect(legalMoves.has('G-9')).toBeFalsy();
      expect(legalMoves.has('H-10')).toBeFalsy();
    });
  });
});
