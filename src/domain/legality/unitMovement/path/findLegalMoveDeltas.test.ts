import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import { createGameState } from '@testing';

import { findLegalMoveDeltas } from './findLegalMoveDeltas';

/**
 * What a player may do next in a move, given the path written so far.
 */
describe('findLegalMoveDeltas function', () => {
  // A lone black unit on E-5 facing north, Speed 2 and Flexibility 2.
  const openGround = createGameState([
    {
      coord: 'E-5',
      facing: 'north',
      flexibility: 2,
      player: 'black',
      speed: 2,
    },
  ]);
  const loneUnit = getSingleUnitWithPlacementAtCoordinate(
    openGround.boardState,
    'E-5',
  );

  it('at the start of an advance, any turn or a step, and it may stand still', () => {
    expect(
      findLegalMoveDeltas(openGround, loneUnit, [], 'advance'),
    ).toStrictEqual({
      mayStop: true,
      next: ['turnLeft', 'turnRight', 'turnAbout', 'step'],
    });
  });

  it('a retreat opens with a step or a 45° turn, never about, and cannot stand still', () => {
    // §9.1.2, §9.1.4: a retreat must fall back, and never opens facing about.
    expect(
      findLegalMoveDeltas(openGround, loneUnit, [], 'retreat'),
    ).toStrictEqual({
      mayStop: false,
      next: ['turnLeft', 'turnRight', 'step'],
    });
  });

  it('with the Speed spent, only turns remain', () => {
    expect(
      findLegalMoveDeltas(openGround, loneUnit, ['step', 'step'], 'advance'),
    ).toStrictEqual({
      mayStop: true,
      next: ['turnLeft', 'turnRight', 'turnAbout'],
    });
  });

  it('a path that is not a legal start to a move has no next move', () => {
    // A third turn with only two points of Flexibility.
    expect(
      findLegalMoveDeltas(
        openGround,
        loneUnit,
        ['turnLeft', 'turnLeft', 'turnLeft'],
        'advance',
      ),
    ).toBeUndefined();
  });

  describe('after stepping into an enemy obliquely from the front', () => {
    // A black attacker on E-4 facing northEast; a white defender on D-5
    // facing south, so E-4 is one of its corner front spaces.
    const gameState = createGameState([
      {
        coord: 'E-4',
        facing: 'northEast',
        flexibility: 2,
        player: 'black',
        speed: 2,
      },
      ['D-5', 'white', 'south'],
    ]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-4',
    );

    it('only the squaring turn may follow, and it may not stop yet', () => {
      // §6.2.3: the move owes the turn that faces the enemy head-on.
      expect(
        findLegalMoveDeltas(gameState, unit, ['step'], 'advance'),
      ).toStrictEqual({ mayStop: false, next: ['turnLeft'] });
    });

    it('once squared, nothing may follow and the move may stop', () => {
      expect(
        findLegalMoveDeltas(gameState, unit, ['step', 'turnLeft'], 'advance'),
      ).toStrictEqual({ mayStop: true, next: [] });
    });
  });
});
