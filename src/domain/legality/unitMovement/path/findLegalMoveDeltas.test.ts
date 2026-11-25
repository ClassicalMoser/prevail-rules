import type { MoveDelta } from '@entities';
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

  it('after a turn, does not offer the turn that would face the way it started', () => {
    // Turned left on E-5, the unit faces north-west. Turning right would face
    // north on E-5 again, a position it has already held this move, so that
    // turn is not offered; the other turns and the step lead somewhere new.
    expect(
      findLegalMoveDeltas(openGround, loneUnit, ['turnLeft'], 'advance'),
    ).toStrictEqual({
      mayStop: true,
      next: ['turnLeft', 'turnAbout', 'step'],
    });
  });

  it('a step with no Speed left is not a legal start to a move', () => {
    // Speed 2 covers two steps; a third has nothing to pay with (§5.1.2).
    expect(
      findLegalMoveDeltas(
        openGround,
        loneUnit,
        ['step', 'step', 'step'],
        'advance',
      ),
    ).toBeUndefined();
  });

  it('a path that comes back to a position it held is not a legal start to a move', () => {
    // Left then right, or about twice, ends on E-5 facing north, where the
    // move began.
    expect(
      findLegalMoveDeltas(
        openGround,
        loneUnit,
        ['turnLeft', 'turnRight'],
        'advance',
      ),
    ).toBeUndefined();
    expect(
      findLegalMoveDeltas(
        openGround,
        loneUnit,
        ['turnAbout', 'turnAbout'],
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

    it('a turn the other way after the step is not a legal move', () => {
      // Turning right would leave it 90° off head-on, an engagement the
      // rules never make (§6.3.1).
      expect(
        findLegalMoveDeltas(gameState, unit, ['step', 'turnRight'], 'advance'),
      ).toBeUndefined();
    });
  });

  describe('facing a friend too stiff to pass', () => {
    // A black unit on E-5 facing north, Speed 2 and Flexibility 2, with a
    // friend of Flexibility 2 on D-5: 2 and 2 make less than the 6 needed to
    // pass (§5.4.2), and a move may never end on a friend (§5.3).
    const gameState = createGameState([
      {
        coord: 'E-5',
        facing: 'north',
        flexibility: 2,
        player: 'black',
        speed: 2,
      },
      { coord: 'D-5', facing: 'north', flexibility: 2, player: 'black' },
    ]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-5',
    );

    it('does not offer the step into the friend, only the turns', () => {
      expect(findLegalMoveDeltas(gameState, unit, [], 'advance')).toStrictEqual(
        {
          mayStop: true,
          next: ['turnLeft', 'turnRight', 'turnAbout'],
        },
      );
    });

    it('a step into the friend is not a legal start to a move', () => {
      expect(
        findLegalMoveDeltas(gameState, unit, ['step'], 'advance'),
      ).toBeUndefined();
    });
  });
  describe('a part that leads nowhere is not offered', () => {
    // TODO(misleading): passing through a friend is §5.4.2, not §6.2.5,
    // which does not exist. Settled by correcting the citation.
    // A black unit on E-5 facing north with two points of Speed, and friendly
    // units on D-5 and C-5 it may pass through (§6.2.5: a combined Flexibility
    // of 6). Stepping onto D-5 and then C-5 spends all its Speed on a friend's
    // space, and a unit may not stop on a friend's space, so no move can end
    // after that second step.
    const gameState = createGameState([
      {
        coord: 'E-5',
        facing: 'north',
        flexibility: 4,
        player: 'black',
        speed: 2,
      },
      {
        coord: 'D-5',
        facing: 'north',
        flexibility: 4,
        player: 'black',
        speed: 2,
      },
      {
        coord: 'C-5',
        facing: 'north',
        flexibility: 4,
        player: 'black',
        speed: 2,
      },
    ]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-5',
    );

    it('does not offer a step whose space it could neither stop on nor move on from', () => {
      // After passing through D-5 the unit may turn aside and stop, but
      // stepping on to C-5 spends its last Speed where it cannot stop, so a
      // player who took that step could never finish the move.
      const offered = findLegalMoveDeltas(gameState, unit, ['step'], 'advance');
      expect(offered?.next).not.toContain('step');
    });

    it('offers only parts from which the move can be finished, on every path', () => {
      // Walk every path the offers allow, a part at a time, and require that
      // each one ends where the move may stop. A path the offers lead into
      // but cannot finish is the fault.
      const stranded: string[] = [];
      const walk = (prefix: readonly MoveDelta[]): void => {
        const offered = findLegalMoveDeltas(gameState, unit, prefix, 'advance');
        if (offered === undefined) {
          stranded.push(`${prefix.join(',')} is not a path`);
          return;
        }
        if (offered.next.length === 0 && !offered.mayStop) {
          stranded.push(prefix.join(','));
        }
        for (const delta of offered.next) {
          walk([...prefix, delta]);
        }
      };
      walk([]);
      // A few are enough to show the fault without listing every path.
      expect(stranded.slice(0, 3)).toStrictEqual([]);
    });
  });
});
