import type { UnitWithPlacement } from '@entities';
import type { AttackApplyState, GameState } from '@game';
import { createAttackApplyState } from '@factories';
import {
  createGameStateResolvingCommand,
  createGameStateWithUnits,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
  enemyBlockingStraightBack,
  enemyCuttingOffRetreat,
  placed,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { generateOpenRetreatFromAttackApplyEvent } from './generateOpenRetreatFromAttackApplyEvent';

/**
 * An attack that retreated leaves the retreat slot pending until this opener runs.
 */
describe('generateOpenRetreatFromAttackApplyEvent function', () => {
  // White's unit on E-5 facing north, its back to row F.
  const target = placed(createTestUnit('white', { attack: 2 }), 'E-5', 'north');

  // Black's archer two spaces ahead of it, facing it. The shot it fired is
  // already measured; it stands on the board so the shot came from somewhere.
  // A different unit type from the enemy fixtures behind the target, so no
  // two black units share an identity.
  const shooter = placed(
    createTestUnit('black', { attack: 2 }),
    'C-5',
    'south',
  );

  // A shot that reached the target's Retreat and nothing higher.
  const retreatOnly = createAttackApplyState(target.unit, {
    unitRetreated: true,
    unitReversed: false,
    unitRouted: false,
  });

  /**
   * Phase 3, carrying out black's shot at white's target, on a board holding
   * these units.
   */
  function resolvingShot(
    units: UnitWithPlacement[],
    attackApplyState: AttackApplyState,
  ): GameState {
    const board = createGameStateWithUnits(units);
    const shot = createRangedAttackResolutionState(board, {
      attackApplyState,
      attackingUnit: shooter.unit,
      defendingUnit: target.unit,
    });
    const resolving = createGameStateResolvingCommand(shot, board);
    return resolving;
  }

  it('records the one retreat open to a unit with room behind it', () => {
    // §9.1.3: on an empty board the smallest retreat is one step straight
    // back, and it is worked out here so the log shows what was legal.
    const state = resolvingShot([target, shooter], retreatOnly);

    // Which apply it opens on is the state's to name; the event carries only
    // what was legal.
    expect(generateOpenRetreatFromAttackApplyEvent(state)).toStrictEqual({
      effectType: 'openRetreatFromAttackApply',
      eventType: 'gameEffect',
      retreatPaths: [['step']],
    });
  });

  it('records both equally small retreats when the way straight back is held', () => {
    // An enemy on F-5 blocks the step straight back; turning 45° either way
    // and stepping back are the two smallest retreats left (§9.1.3, §9.1.4).
    const blocker = enemyBlockingStraightBack(target);
    const state = resolvingShot([target, shooter, blocker], retreatOnly);

    const event = generateOpenRetreatFromAttackApplyEvent(state);

    expect(event.retreatPaths).toStrictEqual([
      ['turnLeft', 'step'],
      ['turnRight', 'step'],
    ]);
  });

  it('records no retreat for a unit whose way back is cut, so it will rout instead', () => {
    // An enemy behind the target, facing it, cuts its line of withdrawal
    // (§9.1.5); a unit that must retreat and cannot routs (§9.1.6).
    const cutter = enemyCuttingOffRetreat(target);
    const state = resolvingShot([target, shooter, cutter], retreatOnly);

    const event = generateOpenRetreatFromAttackApplyEvent(state);

    // Nothing is legal, and the empty list is the record of it.
    expect(event.retreatPaths).toStrictEqual([]);
  });

  it("in a melee, records the retreats of the second player's unit, which falls back first", () => {
    // White holds the initiative, as a new game starts, so white's blow lands
    // first and black's unit falls back first (§7.5.6).
    const white = placed(
      createTestUnit('white', { attack: 2 }),
      'E-5',
      'north',
    );
    const black = placed(createTestUnit('black'), 'E-5', 'south');

    // A white unit stands behind black's, looking away: black's straight step
    // back is held, white's is open. The two units' retreats differ, so the
    // event shows whose was measured.
    const behindBlack = enemyBlockingStraightBack(black);
    const board = createGameStateWithUnits([white, black, behindBlack]);

    // Each unit's blow reached the other's Retreat, and neither retreat is open.
    const reachedRetreat = {
      unitRetreated: true,
      unitReversed: false,
      unitRouted: false,
    };
    const melee = createMeleeResolutionState(board, {
      attackOnFirstPlayerApplyState: createAttackApplyState(
        white.unit,
        reachedRetreat,
      ),
      attackOnSecondPlayerApplyState: createAttackApplyState(
        black.unit,
        reachedRetreat,
      ),
    });
    const fighting = updatePhaseState(
      board,
      createResolveMeleePhaseState(board, {
        currentMeleeResolutionState: melee,
      }),
    );

    // Black's unit, its straight way back held, has the two turns and a step.
    expect(
      generateOpenRetreatFromAttackApplyEvent(fighting).retreatPaths,
    ).toStrictEqual([
      ['turnLeft', 'step'],
      ['turnRight', 'step'],
    ]);
  });

  it('throws when the attack drove nobody back', () => {
    // A shot that reached only the target's Reverse owes no retreat.
    const reverseOnly = createAttackApplyState(target.unit, {
      unitRetreated: false,
      unitReversed: true,
      unitRouted: false,
    });
    const state = resolvingShot([target, shooter], reverseOnly);

    expect(() => generateOpenRetreatFromAttackApplyEvent(state)).toThrow(
      'The retreat is not pending on the ranged attack apply',
    );
  });
});
