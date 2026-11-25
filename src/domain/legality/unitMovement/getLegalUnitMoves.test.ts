import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import {
  createGameState,
  createGameStateWithEngagedUnits,
  createTestUnit,
  hasMove,
  placed,
} from '@testing';

import { getLegalUnitMoves } from './getLegalUnitMoves';

/**
 * GetLegalUnitMoves: every ending an ordered move may reach, each with the
 * path a player submits to make it.
 */
describe('getLegalUnitMoves function', () => {
  describe('basic functionality', () => {
    it('standing where it is, facing as it was, is a legal move', () => {
      // An ordered unit may move zero steps and zero turns, and still counts
      // as commanded (§5.5 edge case).
      const gameState = createGameState([['D-7', 'black', 'southEast']]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'D-7',
      );

      const moves = getLegalUnitMoves(unit, gameState);
      // Its own space and facing is among the endings.
      expect(hasMove(moves, 'D-7', 'southEast')).toBe(true);
    });

    it('a card committed for Speed lets the move reach a space further', () => {
      // A Speed-2 unit on E-5 facing north reaches C-5 at most; committed
      // +1 Speed (§4.3.10, §8) carries it on to B-5.
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', player: 'black', speed: 2 },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );

      const uncommitted = getLegalUnitMoves(unit, gameState);
      const committed = getLegalUnitMoves(unit, gameState, [
        { type: 'speed', value: 1 },
      ]);

      // Two steps stop short of B-5; the card's third reaches it.
      expect(hasMove(uncommitted, 'B-5', 'north')).toBe(false);
      expect(hasMove(committed, 'B-5', 'north')).toBe(true);
    });

    it('each legal move carries the path that makes it', () => {
      // A lone unit on E-5 facing north; one step ahead reaches D-5.
      const gameState = createGameState([['E-5', 'black', 'north']]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );

      const moves = getLegalUnitMoves(unit, gameState);
      const stepAhead = [...moves].find(
        (move) =>
          move.placement.coordinate === 'D-5' &&
          move.placement.facing === 'north' &&
          move.speedUsed === 1,
      );

      // The path a player submits for that ending: one step.
      expect(stepAhead?.path).toStrictEqual(['step']);
    });
  });

  describe('one way to each ending', () => {
    it('offers only the plainest way to an ending reachable more than one way', () => {
      // A Flexibility-4 unit on E-5 facing north can come to face south on
      // E-5 by one turn about, or by four turns left. Where a move ends is
      // what the offer is for, so it lists the plainer way only.
      const gameState = createGameState([
        { coord: 'E-5', facing: 'north', flexibility: 4, player: 'black' },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );

      const facingAbout = [...getLegalUnitMoves(unit, gameState)].filter(
        (move) =>
          move.placement.coordinate === 'E-5' &&
          move.placement.facing === 'south',
      );

      // One way listed, the single turn about.
      expect(facingAbout.map((move) => move.path)).toStrictEqual([
        ['turnAbout'],
      ]);
    });

    it('lists each ending once', () => {
      // However many ways lead to a space and facing, it appears once.
      const gameState = createGameState([
        {
          coord: 'E-5',
          facing: 'north',
          flexibility: 4,
          player: 'black',
          speed: 4,
        },
      ]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-5',
      );

      const moves = [...getLegalUnitMoves(unit, gameState)];
      const endings = new Set(
        moves.map(
          (move) => `${move.placement.coordinate} ${move.placement.facing}`,
        ),
      );

      // As many moves as distinct endings: none is listed twice.
      expect(moves).toHaveLength(endings.size);
    });
  });

  describe('error cases', () => {
    // An order names a unit free to move, where it stands; anything else is
    // a question the expected engine never asks.
    it('throws when the unit named is not the one on its space', () => {
      const gameState = createGameState([['D-7', 'black', 'southEast']]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'D-7',
      );

      // The same kind of unit, another instance number: not the one there.
      const differentUnit = {
        ...unit,
        unit: {
          ...unit.unit,
          instanceNumber: unit.unit.instanceNumber + 1,
        },
      };
      expect(() => getLegalUnitMoves(differentUnit, gameState)).toThrow(
        'Unit is not present at the starting position',
      );
    });

    it('throws when no unit stands on the space the placement names', () => {
      const gameState = createGameState([['E-7', 'black', 'southEast']]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'E-7',
      );

      // Create a unitWithPlacement with the unit but wrong coordinate
      const unitWithWrongCoordinate = {
        ...unit,
        placement: {
          ...unit.placement,
          coordinate: 'D-7' as const,
        },
      };

      expect(() =>
        getLegalUnitMoves(unitWithWrongCoordinate, gameState),
      ).toThrow('No movable unit at starting position');
    });

    it('throws when the unit faces another way than the placement says', () => {
      const gameState = createGameState([['D-7', 'black', 'southEast']]);
      const unit = getSingleUnitWithPlacementAtCoordinate(
        gameState.boardState,
        'D-7',
      );

      // Create a unitWithPlacement with incorrect facing
      const unitWithWrongFacing = {
        ...unit,
        placement: {
          ...unit.placement,
          facing: 'north' as const,
        },
      };

      expect(() => getLegalUnitMoves(unitWithWrongFacing, gameState)).toThrow(
        'Reported facing is inaccurate',
      );
    });

    it('throws when the unit is locked in an engagement', () => {
      // An engaged unit cannot be ordered (§4.3.4).
      const primaryUnit = createTestUnit('black');
      const secondaryUnit = createTestUnit('white');
      const gameState = createGameStateWithEngagedUnits(
        primaryUnit,
        secondaryUnit,
        'D-7',
        'southEast',
      );

      const unitWithPlacement = placed(primaryUnit, 'D-7', 'southEast');

      expect(() => getLegalUnitMoves(unitWithPlacement, gameState)).toThrow(
        'No movable unit at starting position',
      );
    });
  });
});
