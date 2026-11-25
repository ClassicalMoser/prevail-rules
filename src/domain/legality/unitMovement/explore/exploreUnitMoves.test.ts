import type { UnitFacing } from '@entities';
import { unitFacings } from '@entities';
import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import { createGameState, hasMove } from '@testing';

import { exploreUnitMoves } from './exploreUnitMoves';

/**
 * ExploreUnitMoves: full move search with flexibility and speed usage per placement.
 */
describe('exploreUnitMoves function', () => {
  describe('initial position', () => {
    it('an advance may end where it stands, at no cost', () => {
      // A lone black unit on E-5 facing north.
      const gameState = createGameState([['E-5', 'black', 'north']]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );

      const moves = exploreUnitMoves(gameState, unit, 'advance');

      // An order to stand still is a real move (§5.5): nothing spent.
      expect([...moves]).toContainEqual({
        flexibilityUsed: 0,
        path: [],
        placement: { coordinate: 'E-5', facing: 'north' },
        speedUsed: 0,
      });
    });

    it('a retreat may not end where it stands', () => {
      // A lone black unit on E-5 facing north.
      const gameState = createGameState([['E-5', 'black', 'north']]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );

      const moves = exploreUnitMoves(gameState, unit, 'retreat');

      // A retreat must fall back (§9.1.2), so its start is no ending, in
      // any facing.
      expect(hasMove(moves, 'E-5')).toBe(false);
    });

    it('one turn in place reaches 45° either way or about, nothing else', () => {
      // A black unit on E-5 facing north with two turns in it.
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
      for (const facing of oneTurnFacings) {
        expect([...moves]).toContainEqual(
          expect.objectContaining({
            flexibilityUsed: 1,
            placement: { coordinate: 'E-5', facing },
            speedUsed: 0,
          }),
        );
      }
      // Every other facing is a wheel: two spends, never one.
      const wheelFacings: UnitFacing[] = unitFacings.filter(
        (facing) => facing !== 'north' && !oneTurnFacings.includes(facing),
      );
      for (const facing of wheelFacings) {
        expect([...moves]).not.toContainEqual(
          expect.objectContaining({
            flexibilityUsed: 1,
            placement: { coordinate: 'E-5', facing },
          }),
        );
        expect([...moves]).toContainEqual(
          expect.objectContaining({
            flexibilityUsed: 2,
            placement: { coordinate: 'E-5', facing },
            speedUsed: 0,
          }),
        );
      }
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

      expect(hasMove(moves, 'E-5', 'east')).toBe(false);
      expect(hasMove(moves, 'E-5', 'west')).toBe(false);
      // The about-turn, though, is one motion (§5.2.1).
      expect([...moves]).toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 1,
          placement: { coordinate: 'E-5', facing: 'south' },
        }),
      );
    });

    it('a move that walks away and comes back may not end where it began', () => {
      // A black unit on E-5 facing north, Speed 2 and Flexibility 2: enough
      // to step out to D-5, turn about, and step home facing south.
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

      // Its own space is an ending only for a unit that never left it
      // (§5.3); turning about where it stands reaches the same place for less.
      expect([...moves]).not.toContainEqual(
        expect.objectContaining({
          placement: { coordinate: 'E-5', facing: 'south' },
          speedUsed: 2,
        }),
      );
    });
  });

  describe('advance direction', () => {
    it('steps straight ahead one space for each point of Speed, and no further', () => {
      // A black unit on E-5 facing north with Speed 3.
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

      // Each step costs 1 Speed (§5.1.2): D-5, C-5 and B-5 for 1, 2 and 3.
      expect([...moves]).toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 0,
          placement: { coordinate: 'D-5', facing: 'north' },
          speedUsed: 1,
        }),
      );
      expect([...moves]).toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 0,
          placement: { coordinate: 'C-5', facing: 'north' },
          speedUsed: 2,
        }),
      );
      expect([...moves]).toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 0,
          placement: { coordinate: 'B-5', facing: 'north' },
          speedUsed: 3,
        }),
      );
      // A fourth step, to A-5, is past its Speed.
      expect(hasMove(moves, 'A-5')).toBe(false);
    });

    it('turns 45° and steps onto the diagonal it then faces', () => {
      // A black unit on E-5 facing north, Speed 2 and Flexibility 2.
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

      // A unit steps only the way it faces (§5.1.3): to reach D-4 or D-6 it
      // turns first, then steps, 1 Flexibility and 1 Speed each.
      expect([...moves]).toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 1,
          placement: { coordinate: 'D-4', facing: 'northWest' },
          speedUsed: 1,
        }),
      );
      expect([...moves]).toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 1,
          placement: { coordinate: 'D-6', facing: 'northEast' },
          speedUsed: 1,
        }),
      );
    });

    it('never spends more Flexibility than the unit has', () => {
      // A black unit on E-5 facing north with one turn in it.
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

      // Every turn costs a point (§5.2.1): no ending uses a second.
      const flexibilitySpent = [...moves].map((move) => move.flexibilityUsed);
      expect(Math.max(...flexibilitySpent)).toBe(1);
    });
  });

  describe('retreat direction', () => {
    it('falls straight back one space for each point of Speed', () => {
      // A black unit on E-5 facing north with Speed 2.
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'retreat');

      // A retreat is a backward move (§9.1.1): it steps away from its
      // facing, to F-5 and G-5, still facing the enemy.
      expect([...moves]).toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 0,
          placement: { coordinate: 'F-5', facing: 'north' },
          speedUsed: 1,
        }),
      );
      expect([...moves]).toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 0,
          placement: { coordinate: 'G-5', facing: 'north' },
          speedUsed: 2,
        }),
      );
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
      expect([...moves]).not.toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 1,
          placement: { coordinate: 'F-5', facing: 'south' },
        }),
      );
      // One spend wheels it no further than 45°: not yet east.
      expect([...moves]).not.toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 1,
          placement: { coordinate: 'F-5', facing: 'east' },
        }),
      );
      // Two spends wheel it 90°, to face east.
      expect([...moves]).toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 2,
          placement: { coordinate: 'F-5', facing: 'east' },
          speedUsed: 1,
        }),
      );
    });

    it('turns 45° before falling back, then steps away from its new facing', () => {
      // A black unit on E-5 facing north, Speed 2 and Flexibility 2.
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

      // Before its first step a retreat may turn 45° (§9.1.4). Facing
      // north-west it falls back south-east, to F-6; facing north-east it
      // falls back south-west, to F-4.
      expect([...moves]).toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 1,
          placement: { coordinate: 'F-6', facing: 'northWest' },
          speedUsed: 1,
        }),
      );
      expect([...moves]).toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 1,
          placement: { coordinate: 'F-4', facing: 'northEast' },
          speedUsed: 1,
        }),
      );
    });

    it('may turn 45° after stepping back', () => {
      // A black unit on E-5 facing north, Speed 2 and Flexibility 2.
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

      // A step back to F-5, then a turn to face north-east there (§9.1.4).
      expect([...moves]).toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 1,
          placement: { coordinate: 'F-5', facing: 'northEast' },
          speedUsed: 1,
        }),
      );
    });

    it('stays behind the rank it started on, even where its steps could swing back to it', () => {
      // A nimble black unit on E-5 facing north, Speed 3 and Flexibility 5.
      // Turned 45° and stepped back to F-4, it has the turns to face south
      // and the Speed to step "back" north again, onto E-4 beside its start.
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'north',
          flexibility: 5,
          player: 'black',
          speed: 3,
        },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'retreat');

      // A retreat stays in the region behind its starting position, both
      // where it passes and where it ends (§9.1.2): nothing on rank E.
      expect(hasMove(moves, 'E-4')).toBe(false);
      expect(hasMove(moves, 'E-6')).toBe(false);
    });

    it('a unit with no Flexibility falls straight back without turning', () => {
      // A black unit on E-5 facing north with no turn in it.
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', flexibility: 0, player: 'black' },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'retreat');

      // Flexibility 0 cannot turn at all (§5.2.3): every ending still faces
      // north, and none spent a turn.
      const facings = new Set([...moves].map((move) => move.placement.facing));
      expect(facings).toStrictEqual(new Set(['north']));
      expect([...moves].every((move) => move.flexibilityUsed === 0)).toBe(true);
    });
  });

  describe('obstacle handling', () => {
    it('cannot step through an enemy', () => {
      // A black unit on E-5 facing north, Speed 2, with a white unit on
      // D-5 straight ahead.
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'D-5', facing: 'north', player: 'white', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'advance');

      // An enemy's space is never passed through (§5.4.3): C-5, two steps
      // straight on, is out of reach.
      expect([...moves]).not.toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 0,
          placement: { coordinate: 'C-5', facing: 'north' },
          speedUsed: 2,
        }),
      );
    });

    it('navigating around an enemy costs the wheel back onto the line', () => {
      // A black unit on E-5 facing north, Speed 2 and Flexibility 3, with a
      // white unit on D-5 straight ahead.
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
      expect([...moves]).toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 3,
          placement: { coordinate: 'C-5', facing: 'northEast' },
          speedUsed: 2,
        }),
      );
      expect([...moves]).toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 3,
          placement: { coordinate: 'C-5', facing: 'northWest' },
          speedUsed: 2,
        }),
      );
      // The old two-spend zigzag relied on a free 90° turn, which no unit has.
      expect([...moves]).not.toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 2,
          placement: expect.objectContaining({ coordinate: 'C-5' }),
        }),
      );
    });

    it('a front approach off the corner squares up as it closes', () => {
      // §6.2.3: a front engagement ends facing directly opposite the
      // defender. The turn is part of the engaging move and spends the
      // point, so the engagement is offered squared, never 45° off.
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
      expect([...moves]).toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 1,
          placement: { coordinate: 'D-5', facing: 'north' },
          speedUsed: 1,
        }),
      );
      // The unsquared 135° ending must never be offered.
      expect(hasMove(moves, 'D-5', 'northEast')).toBe(false);
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

      expect(hasMove(moves, 'D-5')).toBe(false);
    });

    it('steps straight into an enemy facing it, already squared up', () => {
      // A black unit on E-5 facing north, and a white unit on D-5 facing
      // south: the two look at each other.
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'D-5', facing: 'south', player: 'white', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'advance');

      // From the centre front space the step already faces head on, so the
      // front engagement costs one step and no turn (§6.2.3).
      expect([...moves]).toContainEqual({
        flexibilityUsed: 0,
        path: ['step'],
        placement: { coordinate: 'D-5', facing: 'north' },
        speedUsed: 1,
      });
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
      expect([...moves]).toContainEqual(
        expect.objectContaining({
          flexibilityUsed: 0,
          placement: { coordinate: 'D-6', facing: 'northEast' },
          speedUsed: 1,
        }),
      );
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

      expect(hasMove(moves, 'D-6')).toBe(false);
    });

    it('cannot slip through a diagonal line of enemies', () => {
      // A black unit on E-5 facing north-east, into a white line running
      // corner to corner from B-3 to F-7. D-5 and E-6 are both in it, so
      // the diagonal step to empty D-6 passes between two enemies.
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

      // A blocked diagonal cannot be stepped across (§2.4.4, §5.4.5).
      expect(hasMove(moves, 'D-6')).toBe(false);
    });

    it('cannot loop round an enemy and take it from behind in one move', () => {
      // A nimble black unit on E-5 facing north, Speed 3 and Flexibility 5,
      // and a white unit on D-4 facing south: E-5 is one of its front
      // spaces. Two steps to C-5 put the mover in the defender's back
      // spaces, and three turns face it south-west, onto D-4.
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'north',
          flexibility: 5,
          player: 'black',
          speed: 3,
        },
        { coord: 'D-4', facing: 'south', player: 'white', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'advance');

      // A rear engagement needs the mover to have begun the move behind the
      // defender (§6.2.2), and this one began in front of it.
      expect(hasMove(moves, 'D-4', 'southWest')).toBe(false);
      // From the front it may still close, squared up head on (§6.2.3).
      expect(hasMove(moves, 'D-4', 'north')).toBe(true);
    });

    it('cannot retreat into an enemy unit', () => {
      // A black unit on E-5 facing north, Speed 2, with a white unit on
      // F-5 at its back.
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
        { coord: 'F-5', facing: 'south', player: 'white', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );
      const moves = exploreUnitMoves(gameState, unit, 'retreat');

      // A retreat never enters an enemy's space and never engages (§9.1.7).
      expect(hasMove(moves, 'F-5')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('a unit facing the board edge with no turn in it can only stand', () => {
      // A black unit on A-5, the northern edge, facing north off the board,
      // with no Flexibility to turn away.
      const gameState = createGameState([
        { coord: 'A-5', facing: 'north', flexibility: 0, player: 'black' },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'A-5',
      );

      const moves = exploreUnitMoves(gameState, unit, 'advance');

      // No step off the board, and no turn: standing is the only ending.
      expect([...moves]).toStrictEqual([
        {
          flexibilityUsed: 0,
          path: [],
          placement: { coordinate: 'A-5', facing: 'north' },
          speedUsed: 0,
        },
      ]);
    });
  });
});
