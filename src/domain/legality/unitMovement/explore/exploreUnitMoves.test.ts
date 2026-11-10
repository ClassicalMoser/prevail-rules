import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import type { Coordinate, UnitFacing } from '@entities';
import type { MoveResult } from './moveResult';
import { unitFacings } from '@entities';
import { createGameState } from '@testing';

import { exploreUnitMoves } from './exploreUnitMoves';

/**
 * ExploreUnitMoves: full move search with flexibility and speed usage per placement.
 */
describe('exploreUnitMoves function', () => {
  // Test helper to reduce repetition.
  function exploreResultHasMatch(
    moves: Set<MoveResult>,
    match: {
      coordinate?: Coordinate;
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
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );

      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const hasStartingPosition = exploreResultHasMatch(moves, {
        coordinate: 'E-5',
        facing: 'north',
        flexibilityUsed: 0,
        speedUsed: 0,
      });
      expect(hasStartingPosition).toBe(true);
    });

    it('given not include starting position for retreat', () => {
      expect.hasAssertions();
      const gameState = createGameState([['E-5', 'black', 'north']]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );

      const moves = exploreUnitMoves(gameState, unit, 'retreat');
      const hasStartingPosition = exploreResultHasMatch(moves, {
        coordinate: 'E-5',
      });
      expect(hasStartingPosition).toBe(false);
    });

    it('one turn in place reaches 45° either way or about, nothing else', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'north',
          flexibility: 2,
          player: 'black',
        },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      // One spend turns 45° to a side or 180° about (§5.2.1).
      const oneTurnFacings: UnitFacing[] = ['northWest', 'northEast', 'south'];
      const oneTurnResults = oneTurnFacings.map((facing) =>
        exploreResultHasMatch(moves, {
          coordinate: 'E-5',
          facing,
          flexibilityUsed: 1,
          speedUsed: 0,
        }),
      );
      expect(oneTurnResults.every((result) => result)).toBe(true);
      // Every other facing is a wheel: two spends, never one.
      const wheelFacings: UnitFacing[] = unitFacings.filter(
        (facing) => facing !== 'north' && !oneTurnFacings.includes(facing),
      );
      const wheelsAtOne = wheelFacings.map((facing) =>
        exploreResultHasMatch(moves, {
          coordinate: 'E-5',
          facing,
          flexibilityUsed: 1,
        }),
      );
      expect(wheelsAtOne.some((result) => result)).toBe(false);
      const wheelsAtTwo = wheelFacings.map((facing) =>
        exploreResultHasMatch(moves, {
          coordinate: 'E-5',
          facing,
          flexibilityUsed: 2,
          speedUsed: 0,
        }),
      );
      expect(wheelsAtTwo.every((result) => result)).toBe(true);
    });

    it('a unit with Flexibility 1 cannot wheel to a perpendicular facing', () => {
      // The stiff formation stays stiff: a phalanx with one turn in it
      // cannot swing 90° to meet a flank threat in a single order (§5.2.1).
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'north',
          flexibility: 1,
          player: 'black',
        },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'advance');

      expect(
        exploreResultHasMatch(moves, { coordinate: 'E-5', facing: 'east' }),
      ).toBe(false);
      expect(
        exploreResultHasMatch(moves, { coordinate: 'E-5', facing: 'west' }),
      ).toBe(false);
      // The about-turn, though, is one motion (§5.2.1).
      expect(
        exploreResultHasMatch(moves, {
          coordinate: 'E-5',
          facing: 'south',
          flexibilityUsed: 1,
        }),
      ).toBe(true);
    });

    it('given not include starting position with different speed', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
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
      expect(hasStartingPositionWithSpeedOne).toBe(false);
      expect(hasStartingPositionWithSpeedTwo).toBe(false);
    });
  });
  describe('advance direction', () => {
    it('given the unit has speed, includes a forward move', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const hasForwardMove = exploreResultHasMatch(moves, {
        coordinate: 'D-5',
        speedUsed: 1,
      });
      expect(hasForwardMove).toBe(true);
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
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
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
      expect(hasOneMove).toBe(true);
      expect(hasTwoMoves).toBe(true);
      expect(hasThreeMoves).toBe(true);
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
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
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
      expect(hasForwardLeftMove).toBe(true);
      expect(hasForwardRightMove).toBe(true);
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
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
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
      expect(hasNorthWestMove).toBe(true);
      expect(hasNorthEastMove).toBe(true);
    });

    it('given not include moves that exceed speed', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const hasExcessiveMove = exploreResultHasMatch(moves, {
        coordinate: 'B-5',
      });
      expect(hasExcessiveMove).toBe(false);
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
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      // Should not be able to turn twice
      const hasDoubleTurn = exploreResultHasMatch(moves, {
        coordinate: 'D-5',
        facing: 'south',
        flexibilityUsed: 2,
      });
      expect(hasDoubleTurn).toBe(false);
    });
  });

  describe('retreat direction', () => {
    it('given the unit has speed, includes a rearward move', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'retreat');
      // Retreat moves rearward (south when facing north)
      const hasRearwardMove = exploreResultHasMatch(moves, {
        coordinate: 'F-5',
        facing: 'north',
        flexibilityUsed: 0,
        speedUsed: 1,
      });
      expect(hasRearwardMove).toBe(true);
    });

    it('after the first step back a retreat wheels 45° a spend, and never turns about', () => {
      // §9.1.4: after one step back the unit may turn 45° per spend, so a
      // 90° wheel takes two; turning about is never part of a retreat.
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'north',
          flexibility: 2,
          player: 'black',
          speed: 2,
        },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'retreat');
      // One spend after the step does not reverse it to face south.
      const aboutAfterStepAtOne = exploreResultHasMatch(moves, {
        coordinate: 'F-5',
        facing: 'south',
        flexibilityUsed: 1,
      });
      expect(aboutAfterStepAtOne).toBe(false);
      // One spend wheels it no further than 45°: not yet east.
      const wheelAfterStepAtOne = exploreResultHasMatch(moves, {
        coordinate: 'F-5',
        facing: 'east',
        flexibilityUsed: 1,
      });
      expect(wheelAfterStepAtOne).toBe(false);
      // Two spends wheel it 90°, to face east.
      const wheelAfterStepAtTwo = exploreResultHasMatch(moves, {
        coordinate: 'F-5',
        facing: 'east',
        flexibilityUsed: 2,
        speedUsed: 1,
      });
      expect(wheelAfterStepAtTwo).toBe(true);
    });

    it('given speed > 1, includes multiple rearward moves', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
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
      expect(hasOneMove).toBe(true);
      expect(hasTwoMoves).toBe(true);
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
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
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
      expect(hasTurnLeftThenMove).toBe(true);
      expect(hasTurnRightThenMove).toBe(true);
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
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'retreat');
      // Should not be able to move forward (north) during retreat
      const hasForwardMove = exploreResultHasMatch(moves, {
        coordinate: 'D-5',
        facing: 'north',
        speedUsed: 1,
      });
      expect(hasForwardMove).toBe(false);
      // Should not be able to move parallel (east) during retreat
      const hasRightMove = exploreResultHasMatch(moves, { coordinate: 'E-6' });
      expect(hasRightMove).toBe(false);
      // Should not be able to move parallel (west) during retreat
      const hasLeftMove = exploreResultHasMatch(moves, { coordinate: 'E-4' });
      expect(hasLeftMove).toBe(false);
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
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'retreat');
      // Move rearward then turn to adjacent facing
      const hasMoveThenTurn = exploreResultHasMatch(moves, {
        coordinate: 'F-5',
        facing: 'northEast',
        flexibilityUsed: 1,
        speedUsed: 1,
      });
      expect(hasMoveThenTurn).toBe(true);
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
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
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
      expect(hasTurnRightThenMove).toBe(true);
      expect(hasTurnLeftThenMove).toBe(true);
    });

    it('given not turn in the initial position if no flexibility', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', flexibility: 0, player: 'black' },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
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
      expect(hasRightTurnAndMove).toBe(false);
      expect(hasLeftTurnAndMove).toBe(false);
    });
  });
  describe('obstacle handling', () => {
    it('given not move straight through an enemy unit', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'D-5', facing: 'north', player: 'white', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const hasMove = exploreResultHasMatch(moves, {
        coordinate: 'C-5',
        facing: 'north',
        flexibilityUsed: 0,
        speedUsed: 2,
      });
      expect(hasMove).toBe(false);
    });

    it('navigating around an enemy costs the wheel back onto the line', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'north',
          flexibility: 3,
          player: 'black',
          speed: 2,
        },
        { coord: 'D-5', facing: 'north', player: 'white', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      // Swerving round the blocker is 45° out, then a 90° wheel back in:
      // one turn plus two (§5.2.1), three Flexibility in all.
      const hasLeftThenRightMove = exploreResultHasMatch(moves, {
        coordinate: 'C-5',
        facing: 'northEast',
        flexibilityUsed: 3,
        speedUsed: 2,
      });
      const hasRightThenLeftMove = exploreResultHasMatch(moves, {
        coordinate: 'C-5',
        facing: 'northWest',
        flexibilityUsed: 3,
        speedUsed: 2,
      });
      expect(hasLeftThenRightMove).toBe(true);
      expect(hasRightThenLeftMove).toBe(true);
      // The old two-spend zigzag relied on a free 90° turn, which no unit has.
      const hasCheapZigzag = exploreResultHasMatch(moves, {
        coordinate: 'C-5',
        flexibilityUsed: 2,
      });
      expect(hasCheapZigzag).toBe(false);
    });

    it('a front approach off the corner squares up as it closes', () => {
      // §6.2.3: a front engagement ends facing directly opposite the
      // defender. The turn is part of the engaging move and spends the
      // point, so the engagement is offered squared, never 45° off (A13).
      const gameState = createGameState([
        {
          coord: 'E-4',
          facing: 'northEast',
          // The stand-in catalog's spearmen: one turn in them, so the only
          // way onto D-5 is the diagonal step plus the squaring turn.
          flexibility: 1,
          player: 'black',
          speed: 2,
        },
        { coord: 'D-5', facing: 'south', player: 'white', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-4',
      );
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const squaredEngage = exploreResultHasMatch(moves, {
        coordinate: 'D-5',
        facing: 'north',
        flexibilityUsed: 1,
        speedUsed: 1,
      });
      expect(squaredEngage).toBe(true);
      // The unsquared 135° ending must never be offered.
      const obliqueEngage = exploreResultHasMatch(moves, {
        coordinate: 'D-5',
        facing: 'northEast',
      });
      expect(obliqueEngage).toBe(false);
    });

    it('without Flexibility the cornered front approach cannot close', () => {
      // The squaring turn costs the point (§6.2.3); a unit with none left
      // cannot engage from the off-centre front space at all.
      const gameState = createGameState([
        {
          coord: 'E-4',
          facing: 'northEast',
          // The stand-in catalog's elephants: no turns at all, so the
          // diagonal front approach is the only line to the defender.
          flexibility: 0,
          player: 'black',
          speed: 3,
        },
        { coord: 'D-5', facing: 'south', player: 'white', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-4',
      );
      const moves = exploreUnitMoves(gameState, unit, 'advance');

      expect(exploreResultHasMatch(moves, { coordinate: 'D-5' })).toBe(false);
    });

    it('can engage an enemy unit', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'D-5', facing: 'south', player: 'white', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const hasMove = exploreResultHasMatch(moves, {
        coordinate: 'D-5',
        facing: 'north',
        flexibilityUsed: 0,
        speedUsed: 1,
      });
      expect(hasMove).toBe(true);
    });

    it('a diagonal step can end on an enemy in its flanking space', () => {
      // §6.2.1: engaging from a flanking space is always allowed, straight
      // or diagonal — nothing about the engagement is special for being
      // diagonal. The defender faces northWest, so the attacker's space is
      // at its south-west shoulder: a flank approach.
      const gameState = createGameState([
        { coord: 'E-5', facing: 'northEast', player: 'black', speed: 2 },
        { coord: 'D-6', facing: 'northWest', player: 'white', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const hasDiagonalEngage = exploreResultHasMatch(moves, {
        coordinate: 'D-6',
        facing: 'northEast',
        flexibilityUsed: 0,
        speedUsed: 1,
      });
      expect(hasDiagonalEngage).toBe(true);
    });

    it('two enemies on the corners still shut a diagonal engagement', () => {
      // The step passes the same corner test as any other diagonal step
      // (§5.4.5): enemies in both flanking corner spaces stop it.
      const gameState = createGameState([
        { coord: 'E-5', facing: 'northEast', player: 'black', speed: 2 },
        { coord: 'D-6', facing: 'northWest', player: 'white', speed: 2 },
        { coord: 'D-5', facing: 'south', player: 'white', speed: 2 },
        { coord: 'E-6', facing: 'south', player: 'white', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'advance');

      expect(exploreResultHasMatch(moves, { coordinate: 'D-6' })).toBe(false);
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
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const hasMoveThroughEnemyLine = exploreResultHasMatch(moves, {
        coordinate: 'D-6',
      });
      expect(hasMoveThroughEnemyLine).toBe(false);
    });

    it('cannot encircle in one turn', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 3 },
        { coord: 'D-4', facing: 'south', player: 'white', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const hasMoveThroughEnemyLine = exploreResultHasMatch(moves, {
        coordinate: 'D-4',
        facing: 'south',
      });
      expect(hasMoveThroughEnemyLine).toBe(false);
    });

    it('cannot retreat into an enemy unit', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'F-5', facing: 'south', player: 'white', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'retreat');
      const hasMoveIntoEnemyUnit = exploreResultHasMatch(moves, {
        coordinate: 'F-5',
      });
      expect(hasMoveIntoEnemyUnit).toBe(false);
    });
  });
  describe('edge cases', () => {
    it('given the direction is invalid, throws', () => {
      expect.hasAssertions();
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black' },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
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
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'A-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'advance');
      const undefinedResults = [...moves].filter(
        (m) => m.placement.coordinate === undefined,
      );
      expect(undefinedResults).toHaveLength(0);
    });
  });
});
