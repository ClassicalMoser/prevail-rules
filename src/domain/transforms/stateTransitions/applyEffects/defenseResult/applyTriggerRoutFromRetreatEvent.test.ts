import type { TriggerRoutFromRetreatEvent } from '@events';
import type { GameState } from '@game';
import {
  getRangedAttackApplyState,
  getMeleeRetreatState,
  getRangedAttackRetreatState,
  isOpenSubstep,
} from '@queries';
import {
  createAttackApplyStateWithRetreat,
  createAttackApplyStateWithRetreatAndReverse,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';

import { applyTriggerRoutFromRetreatEvent } from './applyTriggerRoutFromRetreatEvent';

import { createEmptyGameState } from '@factories';
/**
 * Illegal retreat: nests a fresh `rout` substep under the existing retreat apply (ranged) or
 * the indicated melee side, preserving retreat metadata until rout resolution runs.
 */
describe('applyTriggerRoutFromRetreatEvent function', () => {
  /** IssueCommands + ranged retreat substep only (no rout yet). */
  function createStateWithRangedAttackRetreat(): GameState {
    const state = createEmptyGameState('standard');
    const retreatingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(retreatingUnit, 'E-5', 'north');

    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };

    // Nowhere to go: the nested rout is still due, so it stays pending.
    const attackApplyState = createAttackApplyStateWithRetreat(
      unitWithPlacement,
      {
        retreatState: createRetreatState(unitWithPlacement, {
          legalRetreatPaths: [],
        }),
      },
    );
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
  ): GameState {
    const state = createEmptyGameState('standard');
    const retreatingUnit = createTestUnit(retreatingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(
      retreatingPlayer === 'white' ? 'black' : 'white',
      {
        attack: 2,
      },
    );

    const retreatingUnitWithPlacement = placed(retreatingUnit, 'E-5', 'north');
    const otherUnitWithPlacement = placed(otherUnit, 'E-5', 'south');

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

    // Nowhere to go: the nested rout is still due, so it stays pending.
    const attackApplyState = createAttackApplyStateWithRetreat(
      retreatingUnitWithPlacement,
      {
        retreatState: createRetreatState(retreatingUnitWithPlacement, {
          legalRetreatPaths: [],
        }),
      },
    );
    const meleeState = createMeleeResolutionState(
      stateWithUnits,
      retreatingPlayer === 'white'
        ? { secondPlayerAttackApplyState: attackApplyState }
        : { firstPlayerAttackApplyState: attackApplyState },
    );
    const phaseState = createResolveMeleePhaseState(stateWithUnits, {
      currentMeleeResolutionState: meleeState,
    });

    return updatePhaseState(stateWithUnits, phaseState);
  }

  describe('ranged retreat context', () => {
    it('given ranged retreat flow, trigger adds rout substep targeting retreating player unit', () => {
      const state = createStateWithRangedAttackRetreat();
      const retreatState = getRangedAttackRetreatState(state);

      // Event does not specify player - function determines it from state
      const event: TriggerRoutFromRetreatEvent = {
        effectType: 'triggerRoutFromRetreat',
        eventNumber: 0,
        eventType: 'gameEffect',
        retreatResolutionContext: 'rangedAttack',
      };

      const newState = applyTriggerRoutFromRetreatEvent(event, state);
      const newRetreatState = getRangedAttackRetreatState(newState);

      // triggerRoutFromRetreat opens the nested rout under this retreat.
      const rout = newRetreatState.routState;
      expect(isOpenSubstep(rout)).toBe(true);
      if (!isOpenSubstep(rout)) {
        throw new Error('expected open rout');
      }
      expect(rout.substepType).toBe('rout');
      expect(rout.player).toBe(retreatState.retreatingUnit.unit.playerSide);
      expect(rout.unitsToRout).toContain(retreatState.retreatingUnit.unit);
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
      const newRetreatState = getRangedAttackRetreatState(newState);

      // triggerRoutFromRetreat opens the nested rout under this retreat.
      const rout = newRetreatState.routState;
      expect(isOpenSubstep(rout)).toBe(true);
      if (!isOpenSubstep(rout)) {
        throw new Error('expected open rout');
      }
      expect(rout.numberToDiscard).toBe('pending');
      expect(rout.cardsChosen).toBe(false);
      expect(rout.completed).toBe(false);
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
      const newRetreatState = getMeleeRetreatState(newState, 'black');

      // triggerRoutFromRetreat opens the nested rout under this retreat.
      const rout = newRetreatState.routState;
      expect(isOpenSubstep(rout)).toBe(true);
      if (!isOpenSubstep(rout)) {
        throw new Error('expected open rout');
      }
      expect(rout.player).toBe('black');
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
      const newRetreatState = getMeleeRetreatState(newState, 'white');

      // triggerRoutFromRetreat opens the nested rout under this retreat.
      const rout = newRetreatState.routState;
      expect(isOpenSubstep(rout)).toBe(true);
      if (!isOpenSubstep(rout)) {
        throw new Error('expected open rout');
      }
      expect(rout.player).toBe('white');
    });
  });

  describe('rout supersedes reverse', () => {
    it('bypasses a still-pending reverse on the apply when the retreat routs', () => {
      const state = createEmptyGameState('standard');
      const retreatingUnit = createTestUnit('white', { attack: 2 });
      const unitWithPlacement = placed(retreatingUnit, 'E-5', 'north');
      const stateWithUnit = {
        ...state,
        boardState: addUnitToBoard(state.boardState, unitWithPlacement),
      };
      // Retreat and reverse were both due; nowhere to go opens a rout instead.
      const attackApplyState = createAttackApplyStateWithRetreatAndReverse(
        unitWithPlacement,
        {
          retreatState: createRetreatState(unitWithPlacement, {
            legalRetreatPaths: [],
          }),
        },
      );
      expect(attackApplyState.reverseState).toBe('pending');
      const ranged = createRangedAttackResolutionState(stateWithUnit, {
        attackApplyState,
      });
      const full = updatePhaseState(
        stateWithUnit,
        createIssueCommandsPhaseState(stateWithUnit, {
          currentCommandResolutionState: ranged,
        }),
      );
      const event: TriggerRoutFromRetreatEvent = {
        effectType: 'triggerRoutFromRetreat',
        eventNumber: 0,
        eventType: 'gameEffect',
        retreatResolutionContext: 'rangedAttack',
      };

      const next = applyTriggerRoutFromRetreatEvent(event, full);
      const apply = getRangedAttackApplyState(next);
      expect(apply.reverseState).toBe('bypassed');
    });
  });

  describe('structural update', () => {
    it('given retreat routState ref before ranged trigger, input retreat unchanged after apply', () => {
      const state = createStateWithRangedAttackRetreat();
      const retreatState = getRangedAttackRetreatState(state);
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
