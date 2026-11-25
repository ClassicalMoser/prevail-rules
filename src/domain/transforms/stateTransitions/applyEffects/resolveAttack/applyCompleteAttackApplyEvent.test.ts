import type { UnitInstance } from '@entities';
import type { CompleteAttackApplyEvent } from '@events';
import type { AttackApplyState, GameState } from '@game';
import { getMeleeResolutionState, getRangedAttackApplyState } from '@queries';
import {
  createAttackApplyStateWithNothingDue,
  createGameStateResolvingCommand,
  createGameStateWithEngagedUnits,
  createGameStateWithUnits,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
  placed,
} from '@testing';
import {
  updateCurrentInitiative,
  updatePhaseState,
} from '@transforms/pureTransforms';
import { throwIfPending } from '@utils';

import { applyCompleteAttackApplyEvent } from './applyCompleteAttackApplyEvent';

/**
 * Marks the active attack-apply substep finished for the defending player named in the event
 * (ranged single apply vs melee side chosen by initiative order).
 * TODO(misleading): the event names no player; the apply to close is the
 * state's to say (`getAttackApplyToClose`): a shot's only one, or in a melee
 * the second player's unit's before the first player's (§7.5.6). Settle by
 * saying so.
 */
describe('applyCompleteAttackApplyEvent function', () => {
  const event: CompleteAttackApplyEvent = {
    effectType: 'completeAttackApply',
    eventType: 'gameEffect',
  };

  /** White's unit, shot at or fighting on E-5. */
  const whiteUnit = createTestUnit('white', { attack: 2 });

  /** Black's unit, shooting from E-7 or fighting White's on E-5. */
  const blackUnit = createTestUnit('black', { attack: 3 });

  /**
   * Black holds the initiative and carries out a Shoot order: its unit on
   * E-7 shot White's on E-5, which the shot did not move, and the target's
   * results, none of them due, are carried out.
   */
  function shotCarriedOut(): GameState {
    const base = updateCurrentInitiative(
      createGameStateWithUnits([
        placed(whiteUnit, 'E-5', 'south'),
        placed(blackUnit, 'E-7', 'north'),
      ]),
      'black',
    );
    const shot = createRangedAttackResolutionState(base, {
      attackApplyState: createAttackApplyStateWithNothingDue(whiteUnit),
      attackingUnit: blackUnit,
      defendingUnit: whiteUnit,
    });
    const resolving = createGameStateResolvingCommand(shot, base);
    return resolving;
  }

  /** Where one unit's apply stands in the melee. */
  type ApplyStage = 'open' | 'closed' | 'unwritten';

  /** That unit's apply, with neither result due, at that stage. */
  function applyOn(
    unit: UnitInstance,
    stage: ApplyStage,
  ): AttackApplyState | 'pending' {
    // Unwritten until resolveMelee writes both sides' results.
    if (stage === 'unwritten') {
      return 'pending';
    }
    const apply = createAttackApplyStateWithNothingDue(unit, {
      completed: stage === 'closed',
    });
    return apply;
  }

  /**
   * Black holds the initiative, so Black's unit is the first player's and
   * White's the second's (§4.1.5). The two fight on E-5, neither result due;
   * each side's apply is at the stage the case says.
   */
  function meleeCarriedOut(stages: {
    black: ApplyStage;
    white: ApplyStage;
  }): GameState {
    const base = updateCurrentInitiative(
      createGameStateWithEngagedUnits(whiteUnit, blackUnit, 'E-5'),
      'black',
    );
    const melee = createMeleeResolutionState(base, {
      attackOnFirstPlayerApplyState: applyOn(blackUnit, stages.black),
      attackOnSecondPlayerApplyState: applyOn(whiteUnit, stages.white),
    });
    const fighting = updatePhaseState(
      base,
      createResolveMeleePhaseState(base, {
        currentMeleeResolutionState: melee,
      }),
    );
    return fighting;
  }

  /** The apply in one of the melee's slots, which this spec always writes. */
  function written(apply: AttackApplyState | 'pending'): AttackApplyState {
    const opened = throwIfPending(apply, 'The spec wrote both melee applies');
    return opened;
  }

  describe('ranged apply', () => {
    it('closes the one apply of a shot, and changes nothing else on it', () => {
      const next = applyCompleteAttackApplyEvent(event, shotCarriedOut());

      // A shot is one way (§7.4.4), so the target's apply is the one to
      // close; what the shot reached, and on whom, is as it was.
      expect(getRangedAttackApplyState(next)).toStrictEqual({
        attackResult: {
          unitRetreated: false,
          unitReversed: false,
          unitRouted: false,
        },
        completed: true,
        defendingUnit: whiteUnit,
        retreatState: 'bypassed',
        reverseState: 'bypassed',
        routState: 'bypassed',
        substepType: 'attackApply',
      });
    });

    it('leaves the state it was given untouched', () => {
      // A transition returns a new state; the one it read stays as it was.
      const state = shotCarriedOut();
      applyCompleteAttackApplyEvent(event, state);

      expect(getRangedAttackApplyState(state).completed).toBe(false);
    });
  });

  describe('melee apply', () => {
    it('closes the melee apply left open, when it is black’s', () => {
      // White's unit's apply is already closed; Black's is left.
      const next = applyCompleteAttackApplyEvent(
        event,
        meleeCarriedOut({ black: 'open', white: 'closed' }),
      );

      // Black holds the initiative, so its unit's apply is the first
      // player's.
      const melee = getMeleeResolutionState(next);
      expect(written(melee.attackOnFirstPlayerApplyState).completed).toBe(true);
    });

    it('with both melee applies open, closes the second player’s first', () => {
      // Black strikes first, so white's unit suffers first and its apply is
      // the first to close (§7.5.6).
      const next = applyCompleteAttackApplyEvent(
        event,
        meleeCarriedOut({ black: 'open', white: 'open' }),
      );

      const melee = getMeleeResolutionState(next);
      expect(written(melee.attackOnSecondPlayerApplyState).completed).toBe(
        true,
      );
      expect(written(melee.attackOnFirstPlayerApplyState).completed).toBe(
        false,
      );
    });

    it('closes the melee apply left open, when it is white’s', () => {
      // Black's unit's apply is already closed; White's is left.
      const next = applyCompleteAttackApplyEvent(
        event,
        meleeCarriedOut({ black: 'closed', white: 'open' }),
      );

      // White is the second player, so its unit's apply is the second's.
      const melee = getMeleeResolutionState(next);
      expect(written(melee.attackOnSecondPlayerApplyState).completed).toBe(
        true,
      );
    });
  });

  describe('errors', () => {
    it('throws when one side’s melee apply is not written yet', () => {
      // Both sides' results are written by the one resolveMelee effect
      // (§7.2.1), so a melee with only Black's written is a fault in that
      // write.
      const missingWhite = meleeCarriedOut({
        black: 'open',
        white: 'unwritten',
      });

      expect(() => applyCompleteAttackApplyEvent(event, missingWhite)).toThrow(
        'A melee attack apply has not been written yet, so none can close',
      );
    });
  });
});
