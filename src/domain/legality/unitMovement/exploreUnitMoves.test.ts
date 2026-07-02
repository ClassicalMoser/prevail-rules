import type { Board, BoardCoordinate, UnitFacing } from '@entities';
import type { MoveResult } from './exploreUnitMoves';
import { unitFacings } from '@entities';
import { getPlayerUnitWithPosition } from '@queries';
import { createGameState } from '@testing';

import { exploreUnitMoves } from './exploreUnitMoves';

/**
 * ExploreUnitMoves: full move search with flexibility and speed usage per placement.
 */
describe('exploreUnitMoves function', () => {
  // Test helper to reduce repetition.
  function exploreResultHasMatch<TBoard extends Board>(
    moves: Set<MoveResult<TBoard>>,
    match: {
      coordinate?: BoardCoordinate<TBoard>;
      facing?: UnitFacing;
      flexibilityUsed?: number;
      speedUsed?: number;
    },
  ): boolean {
    const { coordinate, facing, flexibilityUsed, speedUsed } = match;
    const result = [...moves].find((m) => {
      if (coordinate !== undefined && m.placement.coordinate !== coordinate) {
        return false;
      }
      if (facing !== undefined && m.placement.facing !== facing) {
        return false;
      }
      if (
        flexibilityUsed !== undefined &&
        m.flexibilityUsed !== flexibilityUsed
      ) {
        return false;
      }
      if (speedUsed !== undefined && m.speedUsed !== speedUsed) {
        return false;
      }
      return true;
    });
    return result !== undefined;
  }

  describe('initial position', () => {
    it('given include starting position for advance', () => {
      expect.hasAssertions();
      const gameState = createGameState([['E-5', 'black', 'north']]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }

      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const hasStartingPosition = exploreResultHasMatch(moves, {
        coordinate: 'E-5',
        facing: 'north',
        flexibilityUsed: 0,
        speedUsed: 0,
      });
      expect(hasStartingPosition).toBeTruthy();
    });

    it('given not include starting position for retreat', () => {
      expect.hasAssertions();
      const gameState = createGameState([['E-5', 'black', 'north']]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }

      const moves = exploreUnitMoves(gameState, unit, 'retreat');
      const hasStartingPosition = exploreResultHasMatch(moves, {
        coordinate: 'E-5',
      });
      expect(hasStartingPosition).toBeFalsy();
    });

    it('given allow all turns in place for advance', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'north',
          flexibility: 2,
          player: 'black',
        },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const unitFacingsMinusStart = unitFacings.filter(
        (facing) => facing !== 'north',
      );
      const allFacingsResults = unitFacingsMinusStart.map((facing) =>
        exploreResultHasMatch(moves, {
          coordinate: 'E-5',
          facing,
          flexibilityUsed: 1,
          speedUsed: 0,
        }),
      );
      expect(allFacingsResults.every((result) => result)).toBeTruthy();
    });

    it('given not include starting position with different speed', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const hasStartingPositionWithSpeedOne = exploreResultHasMatch(moves, {
        coordinate: 'E-5',
        facing: 'north',
        speedUsed: 1,
      });
      const hasStartingPositionWithSpeedTwo = exploreResultHasMatch(moves, {
        coordinate: 'E-5',
        facing: 'north',
        speedUsed: 2,
      });
      expect(hasStartingPositionWithSpeedOne).toBeFalsy();
      expect(hasStartingPositionWithSpeedTwo).toBeFalsy();
    });
  });
  describe('advance direction', () => {
    it('given the unit has speed, includes a forward move', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const hasForwardMove = exploreResultHasMatch(moves, {
        coordinate: 'D-5',
        speedUsed: 1,
      });
      expect(hasForwardMove).toBeTruthy();
    });

    it('given speed > 1, includes multiple forward moves', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'north',
          player: 'black',
          speed: 3,
        },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const hasOneMove = exploreResultHasMatch(moves, {
        coordinate: 'D-5',
        facing: 'north',
        flexibilityUsed: 0,
        speedUsed: 1,
      });
      const hasTwoMoves = exploreResultHasMatch(moves, {
        coordinate: 'C-5',
        facing: 'north',
        flexibilityUsed: 0,
        speedUsed: 2,
      });
      const hasThreeMoves = exploreResultHasMatch(moves, {
        coordinate: 'B-5',
        facing: 'north',
        flexibilityUsed: 0,
        speedUsed: 3,
      });
      expect(hasOneMove).toBeTruthy();
      expect(hasTwoMoves).toBeTruthy();
      expect(hasThreeMoves).toBeTruthy();
    });

    it('given the unit has speed and flexibility, includes turning moves', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'north',
          flexibility: 2,
          player: 'black',
          speed: 2,
        },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const hasForwardLeftMove = exploreResultHasMatch(moves, {
        coordinate: 'D-4',
        facing: 'northWest',
        flexibilityUsed: 1,
        speedUsed: 1,
      });
      const hasForwardRightMove = exploreResultHasMatch(moves, {
        coordinate: 'D-6',
        facing: 'northEast',
        flexibilityUsed: 1,
        speedUsed: 1,
      });
      expect(hasForwardLeftMove).toBeTruthy();
      expect(hasForwardRightMove).toBeTruthy();
    });

    it('given include turn then move sequences in advance', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'north',
          flexibility: 2,
          player: 'black',
          speed: 2,
        },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      // Turn first, then move in the new direction
      // This is already tested by "turning moves" test above
      // But we verify it works for all diagonal directions
      const hasNorthWestMove = exploreResultHasMatch(moves, {
        coordinate: 'D-4',
        facing: 'northWest',
        flexibilityUsed: 1,
        speedUsed: 1,
      });
      const hasNorthEastMove = exploreResultHasMatch(moves, {
        coordinate: 'D-6',
        facing: 'northEast',
        flexibilityUsed: 1,
        speedUsed: 1,
      });
      expect(hasNorthWestMove).toBeTruthy();
      expect(hasNorthEastMove).toBeTruthy();
    });

    it('given not include moves that exceed speed', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const hasExcessiveMove = exploreResultHasMatch(moves, {
        coordinate: 'B-5',
      });
      expect(hasExcessiveMove).toBeFalsy();
    });

    it('given not include moves that exceed flexibility', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'north',
          flexibility: 1,
          player: 'black',
          speed: 2,
        },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      // Should not be able to turn twice
      const hasDoubleTurn = exploreResultHasMatch(moves, {
        coordinate: 'D-5',
        facing: 'south',
        flexibilityUsed: 2,
      });
      expect(hasDoubleTurn).toBeFalsy();
    });
  });

  describe('retreat direction', () => {
    it('given the unit has speed, includes a rearward move', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'retreat');
      // Retreat moves rearward (south when facing north)
      const hasRearwardMove = exploreResultHasMatch(moves, {
        coordinate: 'F-5',
        facing: 'north',
        flexibilityUsed: 0,
        speedUsed: 1,
      });
      expect(hasRearwardMove).toBeTruthy();
    });

    it('given speed > 1, includes multiple rearward moves', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'retreat');
      const hasOneMove = exploreResultHasMatch(moves, {
        coordinate: 'F-5',
        facing: 'north',
        flexibilityUsed: 0,
        speedUsed: 1,
      });
      const hasTwoMoves = exploreResultHasMatch(moves, {
        coordinate: 'G-5',
        facing: 'north',
        flexibilityUsed: 0,
        speedUsed: 2,
      });
      expect(hasOneMove).toBeTruthy();
      expect(hasTwoMoves).toBeTruthy();
    });

    it('given the unit has speed and flexibility, includes turning moves', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'north',
          flexibility: 2,
          player: 'black',
          speed: 2,
        },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'retreat');
      // Turn to adjacent facing then move rearward
      // When facing north, adjacent facings are northEast and northWest
      // Rearward from northEast would be southEast, rearward from northWest would be southWest
      const hasTurnLeftThenMove = exploreResultHasMatch(moves, {
        coordinate: 'F-6',
        facing: 'northWest',
        flexibilityUsed: 1,
        speedUsed: 1,
      });
      const hasTurnRightThenMove = exploreResultHasMatch(moves, {
        coordinate: 'F-4',
        facing: 'northEast',
        flexibilityUsed: 1,
        speedUsed: 1,
      });
      expect(hasTurnLeftThenMove).toBeTruthy();
      expect(hasTurnRightThenMove).toBeTruthy();
    });

    it('given only allow moves to spaces behind starting position', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'north',
          flexibility: 2,
          player: 'black',
          speed: 2,
        },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'retreat');
      // Should not be able to move forward (north) during retreat
      const hasForwardMove = exploreResultHasMatch(moves, {
        coordinate: 'D-5',
        facing: 'north',
        speedUsed: 1,
      });
      expect(hasForwardMove).toBeFalsy();
      // Should not be able to move parallel (east) during retreat
      const hasRightMove = exploreResultHasMatch(moves, { coordinate: 'E-6' });
      expect(hasRightMove).toBeFalsy();
      // Should not be able to move parallel (west) during retreat
      const hasLeftMove = exploreResultHasMatch(moves, { coordinate: 'E-4' });
      expect(hasLeftMove).toBeFalsy();
    });

    it('given include move then turn sequences for retreat', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'north',
          flexibility: 2,
          player: 'black',
          speed: 2,
        },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'retreat');
      // Move rearward then turn to adjacent facing
      const hasMoveThenTurn = exploreResultHasMatch(moves, {
        coordinate: 'F-5',
        facing: 'northEast',
        flexibilityUsed: 1,
        speedUsed: 1,
      });
      expect(hasMoveThenTurn).toBeTruthy();
    });

    it('given include turn then move sequences for retreat', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'north',
          flexibility: 2,
          player: 'black',
          speed: 2,
        },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'retreat');
      const hasTurnRightThenMove = exploreResultHasMatch(moves, {
        coordinate: 'F-4',
        facing: 'northEast',
        flexibilityUsed: 1,
        speedUsed: 1,
      });
      const hasTurnLeftThenMove = exploreResultHasMatch(moves, {
        coordinate: 'F-6',
        facing: 'northWest',
        flexibilityUsed: 1,
        speedUsed: 1,
      });
      expect(hasTurnRightThenMove).toBeTruthy();
      expect(hasTurnLeftThenMove).toBeTruthy();
    });

    it('given not turn in the initial position if no flexibility', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', flexibility: 0, player: 'black' },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'retreat');
      const hasRightTurnAndMove = exploreResultHasMatch(moves, {
        coordinate: 'F-4',
        facing: 'northEast',
        flexibilityUsed: 1,
        speedUsed: 1,
      });
      const hasLeftTurnAndMove = exploreResultHasMatch(moves, {
        coordinate: 'F-6',
        facing: 'northWest',
        flexibilityUsed: 1,
        speedUsed: 1,
      });
      expect(hasRightTurnAndMove).toBeFalsy();
      expect(hasLeftTurnAndMove).toBeFalsy();
    });
  });
  describe('obstacle handling', () => {
    it('given not move straight through an enemy unit', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'D-5', facing: 'north', player: 'white', speed: 2 },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const hasMove = exploreResultHasMatch(moves, {
        coordinate: 'C-5',
        facing: 'north',
        flexibilityUsed: 0,
        speedUsed: 2,
      });
      expect(hasMove).toBeFalsy();
    });

    it('can navigate around an enemy unit', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'D-5', facing: 'north', player: 'white', speed: 2 },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const hasLeftThenRightMove = exploreResultHasMatch(moves, {
        coordinate: 'C-5',
        facing: 'northEast',
        flexibilityUsed: 2,
        speedUsed: 2,
      });
      const hasRightThenLeftMove = exploreResultHasMatch(moves, {
        coordinate: 'C-5',
        facing: 'northWest',
        flexibilityUsed: 2,
        speedUsed: 2,
      });
      expect(hasLeftThenRightMove).toBeTruthy();
      expect(hasRightThenLeftMove).toBeTruthy();
    });

    it('can engage an enemy unit', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'D-5', facing: 'south', player: 'white', speed: 2 },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const hasMove = exploreResultHasMatch(moves, {
        coordinate: 'D-5',
        facing: 'north',
        flexibilityUsed: 0,
        speedUsed: 1,
      });
      expect(hasMove).toBeTruthy();
    });

    it('given not pass through diagonal enemy line', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'northEast', player: 'black', speed: 2 },
        { coord: 'B-3', facing: 'southWest', player: 'white', speed: 2 },
        { coord: 'C-4', facing: 'southWest', player: 'white', speed: 2 },
        { coord: 'D-5', facing: 'southWest', player: 'white', speed: 2 },
        { coord: 'E-6', facing: 'southWest', player: 'white', speed: 2 },
        { coord: 'F-7', facing: 'southWest', player: 'white', speed: 2 },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const hasMoveThroughEnemyLine = exploreResultHasMatch(moves, {
        coordinate: 'D-6',
      });
      expect(hasMoveThroughEnemyLine).toBeFalsy();
    });

    it('cannot encircle in one turn', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 3 },
        { coord: 'D-4', facing: 'south', player: 'white', speed: 2 },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const hasMoveThroughEnemyLine = exploreResultHasMatch(moves, {
        coordinate: 'D-4',
        facing: 'south',
      });
      expect(hasMoveThroughEnemyLine).toBeFalsy();
    });

    it('cannot retreat into an enemy unit', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'F-5', facing: 'south', player: 'white', speed: 2 },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'retreat');
      const hasMoveIntoEnemyUnit = exploreResultHasMatch(moves, {
        coordinate: 'F-5',
      });
      expect(hasMoveIntoEnemyUnit).toBeFalsy();
    });
  });
  describe('edge cases', () => {
    it('given the direction is invalid, throws', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black' },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'E-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      // Bad type assertion to trigger the error
      const direction = 'invalid' as 'advance' | 'retreat';
      expect(() => exploreUnitMoves(gameState, unit, direction)).toThrow(
        'Invalid direction',
      );
    });

    it('given not explore off the map or throw for the edge', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'A-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const unit = getPlayerUnitWithPosition(
        gameState.boardState,
        'A-5',
        'black',
      );
      if (!unit) {
        throw new Error('Unit not found');
      }
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const undefinedResults = [...moves].filter(
        (m) => m.placement.coordinate === undefined,
      );
      expect(undefinedResults).toHaveLength(0);
    });
  });
});
