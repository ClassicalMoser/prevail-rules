import type { PlayerSide, UnitWithPlacement } from '@entities';
import type { TriggerRoutFromRetreatEvent } from '@events';
import type { AttackApplyState, GameState } from '@game';
import { createAttackApplyState } from '@factories';
import {
  findPositionOfUnit,
  getRangedAttackApplyState,
  getRetreatState,
  isOpenSubstep,
} from '@queries';
import {
  createAttackApplyStateWithRetreat,
  createGameStateResolvingCommand,
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

import { applyTriggerRoutFromRetreatEvent } from './applyTriggerRoutFromRetreatEvent';

/**
 * Illegal retreat: nests a fresh `rout` substep under the existing retreat apply (ranged) or
 * the indicated melee side, preserving retreat metadata until rout resolution runs.
 */
describe('applyTriggerRoutFromRetreatEvent function', () => {
  // Any units will do: the apply reads nothing of them but who they are.
  const white = createTestUnit('white');
  const black = createTestUnit('black');

  // Each side's second unit: one stands right behind an enemy and faces its
  // back, which cuts its retreat however much ground lies beyond (§9.1.5).
  const whiteCutter = createTestUnit('white', { instanceNumber: 2 });
  const blackCutter = createTestUnit('black', { instanceNumber: 2 });

  /** The trigger: it carries nothing, since the state names the retreat. */
  const trigger: TriggerRoutFromRetreatEvent = {
    effectType: 'triggerRoutFromRetreat',
    eventType: 'gameEffect',
  };

  /**
   * A shot at White's unit on E-5 facing north, from Black's shooter in
   * front of it on D-5, with Black's second unit on F-5 facing north, right
   * at its back. `apply` builds the target's results from the retreats it
   * has, which are none.
   */
  function shotAtCutOffWhite(
    apply: (retreats: ReturnType<typeof legalRetreatsOf>) => AttackApplyState,
  ): GameState {
    const shooter = createTestUnit('black', { instanceNumber: 3, range: 1 });
    const target = placed(white, 'E-5', 'north');
    const cutter = placed(blackCutter, 'F-5', 'north');
    const base = createGameStateWithUnits([
      target,
      placed(shooter, 'D-5', 'south'),
      cutter,
    ]);

    // The rules find no retreat: its line of withdrawal is cut.
    const retreats = legalRetreatsOf(target, [cutter]);
    const shot = createRangedAttackResolutionState(base, {
      attackApplyState: apply(retreats),
      attackingUnit: shooter,
      defendingUnit: white,
    });

    // Phase 3, with that shot being carried out.
    const resolving = createGameStateResolvingCommand(shot, base);
    return resolving;
  }

  /**
   * A melee on E-5, White's unit facing north and Black's facing it, in
   * which one side's unit was driven back and cannot go: the other side's
   * second unit stands right at its back. White holds the initiative, so
   * its unit's results sit in the first player's slot.
   */
  function meleeCuttingOff(retreating: PlayerSide): GameState {
    const whiteHere = placed(white, 'E-5', 'north');
    const blackHere = placed(black, 'E-5', 'south');
    const cutter: UnitWithPlacement =
      retreating === 'white'
        ? placed(blackCutter, 'F-5', 'north')
        : placed(whiteCutter, 'D-5', 'south');
    const base = createGameStateWithUnits([whiteHere, blackHere, cutter]);

    // The rules find no retreat for the driven unit.
    const [driven, enemy] =
      retreating === 'white' ? [whiteHere, blackHere] : [blackHere, whiteHere];
    const retreats = legalRetreatsOf(driven, [enemy, cutter]);
    const apply = createAttackApplyStateWithRetreat(driven.unit, retreats);
    const melee = createMeleeResolutionState(
      base,
      retreating === 'white'
        ? { attackOnFirstPlayerApplyState: apply }
        : { attackOnSecondPlayerApplyState: apply },
    );

    // Phase 4, with that melee being fought.
    const phase = createResolveMeleePhaseState(base, {
      currentMeleeResolutionState: melee,
    });
    const fighting = updatePhaseState(base, phase);
    return fighting;
  }

  describe('ranged retreat context', () => {
    it('opens a rout in the retreat it replaces, and the unit leaves the board', () => {
      const state = shotAtCutOffWhite((retreats) =>
        createAttackApplyStateWithRetreat(white, retreats),
      );

      const newState = applyTriggerRoutFromRetreatEvent(trigger, state);

      // The rout is nested in White's retreat, which stays open to hold it.
      const retreat = getRetreatState(newState, 'white');
      const rout = retreat.routState;
      if (!isOpenSubstep(rout)) {
        throw new Error('expected open rout');
      }
      // White owes the Morale of its own unit, not yet counted (§9.3.2).
      expect(rout.player).toBe('white');
      expect(rout.unitsToRout).toStrictEqual([white]);
      expect(rout.numberToDiscard).toBe('pending');
      expect(rout.cardsChosen).toBe(false);
      expect(rout.completed).toBe(false);
      expect(retreat.completed).toBe(false);
      // The unit leaves when the rout opens, not when the discard is paid.
      expect(findPositionOfUnit(newState, white)).toBeUndefined();
      expect(newState.routedUnits).toContainEqual(white);
    });
  });

  describe('melee retreat context', () => {
    it.each(['white', 'black'] as const)(
      'the %s retreat in the melee opens its own rout',
      (retreating) => {
        const newState = applyTriggerRoutFromRetreatEvent(
          trigger,
          meleeCuttingOff(retreating),
        );

        // The rout sits in this side's retreat and is this side's to pay.
        const rout = getRetreatState(newState, retreating).routState;
        if (!isOpenSubstep(rout)) {
          throw new Error('expected open rout');
        }
        expect(rout.player).toBe(retreating);
      },
    );
  });

  describe('rout supersedes later results', () => {
    it('bypasses a reverse and a rout the attack also reached, since the unit has already gone', () => {
      // The shot reached all three thresholds. The unit cannot retreat, so it
      // routs at its retreat's turn, and routs only once (§7.5.6).
      const state = shotAtCutOffWhite((retreats) => ({
        ...createAttackApplyState(white, {
          unitRetreated: true,
          unitReversed: true,
          unitRouted: true,
        }),
        retreatState: createRetreatState(white, retreats),
      }));

      const next = applyTriggerRoutFromRetreatEvent(trigger, state);

      // Neither later result is owed any more.
      const apply = getRangedAttackApplyState(next);
      expect(apply.reverseState).toBe('bypassed');
      expect(apply.routState).toBe('bypassed');
    });
  });

  describe('structural update', () => {
    it('leaves the state it was given as it was', () => {
      const state = shotAtCutOffWhite((retreats) =>
        createAttackApplyStateWithRetreat(white, retreats),
      );
      const retreatBefore = getRetreatState(state, 'white');

      applyTriggerRoutFromRetreatEvent(trigger, state);

      // A transition returns a new state; the old one still has the rout
      // unopened and the unit on E-5.
      expect(retreatBefore.routState).toBe('pending');
      expect(findPositionOfUnit(state, white)?.coordinate).toBe('E-5');
    });
  });
});
