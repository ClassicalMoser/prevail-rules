import type { PlayerSide, UnitFacing, UnitInstance } from '@entities';
import type { ResolveReverseEvent } from '@events';
import type { AttackApplyState, GameState } from '@game';
import {
  findPositionOfUnit,
  getMeleeReverseState,
  getRangedAttackReverseState,
} from '@queries';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithReverse,
  createGameStateResolvingCommand,
  createGameStateWithEngagedUnits,
  createGameStateWithUnits,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
  legalRetreatsOf,
  placed,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';

import { applyResolveReverseEvent } from './applyResolveReverseEvent';

// TODO(misleading): "Defender's counterattack facing" — a reverse is not a
// counterattack; it is a unit shaken and turned about (§9.2). Settle by
// rewording this header.
/**
 * Defender’s counterattack facing: turns the unit on its space to the event's `facing` and closes the
 * reverse substep (`completed`) for ranged or the correct melee apply side.
 */
describe('applyResolveReverseEvent function', () => {
  // Any units will do: the apply reads nothing of them but who they are.
  const white = createTestUnit('white');
  const black = createTestUnit('black');

  /**
   * A shot at White's unit on E-5 facing north, from Black's shooter in
   * front of it on D-5, with this apply on the target.
   */
  function shotAtWhite(apply: AttackApplyState): GameState {
    const shooter = createTestUnit('black', { range: 1 });
    const base = createGameStateWithUnits([
      placed(white, 'E-5', 'north'),
      placed(shooter, 'D-5', 'south'),
    ]);
    const shot = createRangedAttackResolutionState(base, {
      attackApplyState: apply,
      attackingUnit: shooter,
      defendingUnit: white,
    });

    // Phase 3, with that shot being carried out.
    const resolving = createGameStateResolvingCommand(shot, base);
    return resolving;
  }

  /**
   * A melee on E-5 in which one unit's reverse is open, and the other unit
   * has already fallen back one step and is done (§7.5.6: both retreats
   * come before either reverse). White holds the initiative, so its unit's
   * results sit in the first player's slot.
   */
  function meleeAfterEnemyFellBack(reversing: PlayerSide): GameState {
    // The reversing unit still stands on E-5; the enemy stood there too,
    // facing it, and is now one step back the way it faced away from.
    const unit = reversing === 'white' ? white : black;
    const enemy = reversing === 'white' ? black : white;
    const facing: UnitFacing = reversing === 'white' ? 'north' : 'south';
    const enemyFacing: UnitFacing = reversing === 'white' ? 'south' : 'north';
    const enemyLanding = reversing === 'white' ? 'D-5' : 'F-5';
    const base = createGameStateWithUnits([
      placed(unit, 'E-5', facing),
      placed(enemy, enemyLanding, enemyFacing),
    ]);

    // The enemy's retreat, worked out from the shared space and carried out.
    const enemyRetreats = legalRetreatsOf(placed(enemy, 'E-5', enemyFacing), [
      placed(unit, 'E-5', facing),
    ]);
    const enemyApply = createAttackApplyStateWithRetreat(enemy, enemyRetreats, {
      retreatState: createRetreatState(enemy, enemyRetreats, {
        completed: true,
      }),
    });
    const unitApply = createAttackApplyStateWithReverse(unit);
    const melee = createMeleeResolutionState(
      base,
      reversing === 'white'
        ? {
            attackOnFirstPlayerApplyState: unitApply,
            attackOnSecondPlayerApplyState: enemyApply,
          }
        : {
            attackOnFirstPlayerApplyState: enemyApply,
            attackOnSecondPlayerApplyState: unitApply,
          },
    );

    // Phase 4, with that melee being fought.
    const phase = createResolveMeleePhaseState(base, {
      currentMeleeResolutionState: melee,
    });
    const fighting = updatePhaseState(base, phase);
    return fighting;
  }

  /** The reverse as its procedure writes it: the unit and its new facing. */
  function reverseOf(
    unit: UnitInstance,
    facing: UnitFacing,
  ): ResolveReverseEvent {
    const event: ResolveReverseEvent = {
      effectType: 'resolveReverse',
      eventType: 'gameEffect',
      facing,
      unit,
    };
    return event;
  }

  describe('ranged reverse substep', () => {
    it('the target of a shot turns about where it stands, and its reverse is done', () => {
      const state = shotAtWhite(createAttackApplyStateWithReverse(white));

      // Facing north, turned 180° it faces south (§9.2.1).
      const next = applyResolveReverseEvent(reverseOf(white, 'south'), state);

      // Same space, the other way round: a reverse is not a move (§9.2.2).
      expect(findPositionOfUnit(next, white)).toStrictEqual({
        coordinate: 'E-5',
        facing: 'south',
      });
      // The reverse is owed nothing more.
      expect(getRangedAttackReverseState(next).completed).toBe(true);
    });
  });

  describe('melee reverse substep', () => {
    it.each([
      { reversing: 'white', turnedTo: 'south' },
      { reversing: 'black', turnedTo: 'north' },
    ] as const)(
      "$reversing's unit, its enemy fallen back, turns about to face $turnedTo and its reverse is done",
      ({ reversing, turnedTo }) => {
        const unit = reversing === 'white' ? white : black;
        const state = meleeAfterEnemyFellBack(reversing);

        // No longer sharing its space, the unit does turn (§7.5.5).
        const next = applyResolveReverseEvent(reverseOf(unit, turnedTo), state);

        // It turns on E-5, and the reverse on its own side is closed.
        expect(findPositionOfUnit(next, unit)).toStrictEqual({
          coordinate: 'E-5',
          facing: turnedTo,
        });
        expect(getMeleeReverseState(next, reversing).completed).toBe(true);
      },
    );
  });

  describe('a unit still engaged', () => {
    it('keeps its facing, and the reverse is done all the same', () => {
      // Both units are still locked on E-5: neither fell back. White's blow
      // reached Black's Reverse, but Black's unit does not turn while it
      // shares its space with an enemy (§7.5.5). The procedure writes its
      // facing unchanged.
      const base = createGameStateWithEngagedUnits(
        white,
        black,
        'E-5',
        'north',
      );
      // Black's blow reached nothing on White.
      const melee = createMeleeResolutionState(base, {
        attackOnFirstPlayerApplyState:
          createAttackApplyStateWithNothingDue(white),
        attackOnSecondPlayerApplyState:
          createAttackApplyStateWithReverse(black),
      });
      const state = updatePhaseState(
        base,
        createResolveMeleePhaseState(base, {
          currentMeleeResolutionState: melee,
        }),
      );

      const next = applyResolveReverseEvent(reverseOf(black, 'south'), state);

      // Black still faces White, and its reverse is closed.
      expect(findPositionOfUnit(next, black)).toStrictEqual({
        coordinate: 'E-5',
        facing: 'south',
      });
      expect(getMeleeReverseState(next, 'black').completed).toBe(true);
    });
  });

  describe('an attack that reached no Reverse', () => {
    it('throws: there is no reverse to resolve', () => {
      // The shot reached White's Retreat and no higher, so its reverse is
      // bypassed. A reverse arriving now is a fault in the sequence.
      const retreats = legalRetreatsOf(placed(white, 'E-5', 'north'));
      const state = shotAtWhite(
        createAttackApplyStateWithRetreat(white, retreats),
      );

      expect(() =>
        applyResolveReverseEvent(reverseOf(white, 'south'), state),
      ).toThrow('This attack apply applied no reverse to resolve');
    });
  });

  describe('structural update', () => {
    it('leaves the state it was given as it was', () => {
      const state = shotAtWhite(createAttackApplyStateWithReverse(white));
      const reverseBefore = getRangedAttackReverseState(state);
      const boardBefore = state.boardState;

      applyResolveReverseEvent(reverseOf(white, 'south'), state);

      // A transition returns a new state; the old one still shows the unit
      // facing north and the reverse unfinished.
      expect(reverseBefore.completed).toBe(false);
      expect(state.boardState).toBe(boardBefore);
      expect(findPositionOfUnit(state, white)?.facing).toBe('north');
    });
  });
});
