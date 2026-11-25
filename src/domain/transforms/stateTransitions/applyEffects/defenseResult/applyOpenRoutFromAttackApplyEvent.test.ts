import type { OpenRoutFromAttackApplyEvent } from '@events';
import type { AttackApplyState, GameState } from '@game';
import { createAttackApplyState } from '@factories';
import {
  findPositionOfUnit,
  getRangedAttackApplyState,
  getRoutState,
} from '@queries';
import {
  createGameStateResolvingCommand,
  createGameStateWithUnits,
  createRangedAttackResolutionState,
  createRetreatState,
  createReverseState,
  createTestUnit,
  legalRetreatsOf,
  placed,
} from '@testing';

import { applyOpenRoutFromAttackApplyEvent } from './applyOpenRoutFromAttackApplyEvent';

/**
 * Opens the rout under an attack apply whose rout slot is still pending.
 */
describe('applyOpenRoutFromAttackApplyEvent function', () => {
  // Any unit will do: the apply reads nothing of it but who it is.
  const target = createTestUnit('white');

  /**
   * A shot that reached all three of its target's thresholds, with the rout
   * the one step left. White's unit stood on E-5 facing north, Black's
   * shooter in front of it on D-5; the unit has since fallen back to F-5
   * and turned about (§7.5.2).
   */
  function shotRouting(): {
    apply: AttackApplyState;
    state: GameState;
  } {
    const shooter = createTestUnit('black', { range: 1 });
    const base = createGameStateWithUnits([
      placed(target, 'F-5', 'south'),
      placed(shooter, 'D-5', 'south'),
    ]);

    // All three thresholds were met. The retreat was the one step back from
    // E-5 on open ground, taken and done; the reverse is done too.
    const measured = createAttackApplyState(target, {
      unitRetreated: true,
      unitReversed: true,
      unitRouted: true,
    });
    const apply: AttackApplyState = {
      ...measured,
      retreatState: createRetreatState(
        target,
        legalRetreatsOf(placed(target, 'E-5', 'north')),
        { completed: true },
      ),
      reverseState: createReverseState(target, { completed: true }),
    };
    const shot = createRangedAttackResolutionState(base, {
      attackApplyState: apply,
      attackingUnit: shooter,
      defendingUnit: target,
    });

    // Phase 3, with that shot being carried out.
    const state = createGameStateResolvingCommand(shot, base);
    return { apply, state };
  }

  /** The open event: it carries nothing, since the state names the apply. */
  const openRout: OpenRoutFromAttackApplyEvent = {
    effectType: 'openRoutFromAttackApply',
    eventType: 'gameEffect',
  };

  it('opens a rout of the defending unit, owed by its owner, and takes the unit off the board', () => {
    const { state } = shotRouting();

    const next = applyOpenRoutFromAttackApplyEvent(openRout, state);

    // White routs its own unit and owes its Morale, not yet counted.
    const rout = getRoutState(next, 'white');
    expect(rout.substepType).toBe('rout');
    expect(rout.unitsToRout).toStrictEqual([target]);
    expect(rout.numberToDiscard).toBe('pending');
    // The unit leaves when the rout opens, not when the discard is paid.
    expect(findPositionOfUnit(next, target)).toBeUndefined();
    expect(next.routedUnits).toContainEqual(target);
  });

  it('leaves the retreat and reverse already carried out as they were', () => {
    // The rout comes last (§7.5.2): by its turn the unit has fallen back and
    // turned about, and those results stay recorded.
    const { apply, state } = shotRouting();

    const next = applyOpenRoutFromAttackApplyEvent(openRout, state);

    // Both earlier results are the same as before the rout opened.
    const after = getRangedAttackApplyState(next);
    expect(after.retreatState).toStrictEqual(apply.retreatState);
    expect(after.reverseState).toStrictEqual(apply.reverseState);
  });
});
