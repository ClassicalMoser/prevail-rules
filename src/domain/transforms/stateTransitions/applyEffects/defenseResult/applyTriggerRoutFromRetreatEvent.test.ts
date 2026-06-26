import type { StandardBoard, UnitWithPlacement } from '@entities';
import type { TriggerRoutFromRetreatEvent } from '@events';
import type { GameStateForBoard } from '@game';
import {
  getRetreatStateFromMelee,
  getRetreatStateFromRangedAttack,
} from '@queries';
import {
  createAttackApplyStateWithRetreat,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';
import { throwIfPending } from '@utils';

import { applyTriggerRoutFromRetreatEvent } from './applyTriggerRoutFromRetreatEvent';

/**
 * Illegal retreat: nests a fresh `rout` substep under the existing retreat apply (ranged) or
 * the indicated melee side, preserving retreat metadata until rout resolution runs.
 */
describe(applyTriggerRoutFromRetreatEvent, () => {
  /** IssueCommands + ranged retreat substep only (no rout yet). */
  function createStateWithRangedAttackRetreat(): GameStateForBoard<StandardBoard> {
    const state = createEmptyGameState();
    const retreatingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: retreatingUnit,
    };

    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };

    const attackApplyState =
      createAttackApplyStateWithRetreat(unitWithPlacement);
    const rangedAttackState = createRangedAttackResolutionState(stateWithUnit, {
      attackApplyState,
    });
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: rangedAttackState,
    });

    return updatePhaseState(stateWithUnit, phaseState);
  }

  /** ResolveMelee + one-sided retreat apply for the named player. */
  function createStateWithMeleeRetreat(
    retreatingPlayer: 'white' | 'black',
  ): GameStateForBoard<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const retreatingUnit = createTestUnit(retreatingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(
      retreatingPlayer === 'white' ? 'black' : 'white',
      {
        attack: 2,
      },
    );

    const retreatingUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: retreatingUnit,
    };
    const otherUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'south',
      },
      unit: otherUnit,
    };

    let stateWithUnits = {
      ...state,
      boardState: addUnitToBoard(state.boardState, retreatingUnitWithPlacement),
    };
    stateWithUnits = {
      ...stateWithUnits,
      boardState: addUnitToBoard(
        stateWithUnits.boardState,
        otherUnitWithPlacement,
      ),
    };

    const attackApplyState = createAttackApplyStateWithRetreat(
      retreatingUnitWithPlacement,
    );
    const meleeState = createMeleeResolutionState(
      stateWithUnits,
      retreatingPlayer === 'white'
        ? { whiteAttackApplyState: attackApplyState }
        : { blackAttackApplyState: attackApplyState },
    );
    const phaseState = createResolveMeleePhaseState(stateWithUnits, {
      currentMeleeResolutionState: meleeState,
    });

    return updatePhaseState(stateWithUnits, phaseState);
  }

  describe('ranged retreat context', () => {
    it('given ranged retreat flow, trigger adds rout substep targeting retreating player unit', () => {
      const state = createStateWithRangedAttackRetreat();
      const retreatState = getRetreatStateFromRangedAttack(state);

      // Event does not specify player - function determines it from state
      const event: TriggerRoutFromRetreatEvent = {
        effectType: 'triggerRoutFromRetreat',
        eventNumber: 0,
        eventType: 'gameEffect',
        retreatResolutionContext: 'rangedAttack',
      };

      const newState = applyTriggerRoutFromRetreatEvent(event, state);
      const newRetreatState = getRetreatStateFromRangedAttack(newState);

      const rout = throwIfPending(newRetreatState.routState, 'rout');
      expect(rout.substepType).toBe('rout');
      expect(rout.player).toBe(retreatState.retreatingUnit.unit.playerSide);
      expect(
        rout.unitsToRout.includes(retreatState.retreatingUnit.unit),
      ).toBeTruthy();
    });

    it('given same trigger, new rout has undefined discard count and not completed', () => {
      const state = createStateWithRangedAttackRetreat();

      // Event does not specify player - function determines it from state
      const event: TriggerRoutFromRetreatEvent = {
        effectType: 'triggerRoutFromRetreat',
        eventNumber: 0,
        eventType: 'gameEffect',
        retreatResolutionContext: 'rangedAttack',
      };

      const newState = applyTriggerRoutFromRetreatEvent(event, state);
      const newRetreatState = getRetreatStateFromRangedAttack(newState);

      const rout = throwIfPending(newRetreatState.routState, 'rout');
      expect(rout.numberToDiscard).toBe('pending');
      expect(rout.cardsChosen).toBeFalsy();
      expect(rout.completed).toBeFalsy();
    });
  });

  describe('melee retreat context', () => {
    it('given black melee retreat, melee trigger with retreatingPlayer black seeds rout', () => {
      const state = createStateWithMeleeRetreat('black');

      // Event does not specify player - function determines it from state
      const event: TriggerRoutFromRetreatEvent = {
        effectType: 'triggerRoutFromRetreat',
        eventNumber: 0,
        eventType: 'gameEffect',
        retreatResolutionContext: 'melee',
        retreatingPlayer: 'black',
      };

      const newState = applyTriggerRoutFromRetreatEvent(event, state);
      const newRetreatState = getRetreatStateFromMelee(newState, 'black');

      expect(throwIfPending(newRetreatState.routState, 'rout').player).toBe(
        'black',
      );
    });

    it('given white melee retreat, melee trigger with retreatingPlayer white seeds rout', () => {
      const state = createStateWithMeleeRetreat('white');

      // Event does not specify player - function determines it from state
      const event: TriggerRoutFromRetreatEvent = {
        effectType: 'triggerRoutFromRetreat',
        eventNumber: 0,
        eventType: 'gameEffect',
        retreatResolutionContext: 'melee',
        retreatingPlayer: 'white',
      };

      const newState = applyTriggerRoutFromRetreatEvent(event, state);
      const newRetreatState = getRetreatStateFromMelee(newState, 'white');

      expect(throwIfPending(newRetreatState.routState, 'rout').player).toBe(
        'white',
      );
    });
  });

  describe('structural update', () => {
    it('given retreat routState ref before ranged trigger, input retreat unchanged after apply', () => {
      const state = createStateWithRangedAttackRetreat();
      const retreatState = getRetreatStateFromRangedAttack(state);
      const originalRoutState = retreatState.routState;

      // Event does not specify player - function determines it from state
      const event: TriggerRoutFromRetreatEvent = {
        effectType: 'triggerRoutFromRetreat',
        eventNumber: 0,
        eventType: 'gameEffect',
        retreatResolutionContext: 'rangedAttack',
      };

      applyTriggerRoutFromRetreatEvent(event, state);

      expect(retreatState.routState).toBe(originalRoutState);
    });
  });
});
