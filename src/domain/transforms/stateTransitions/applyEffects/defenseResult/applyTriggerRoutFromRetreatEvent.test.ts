import type { StandardBoard, UnitWithPlacement } from '@entities';
import type { TriggerRoutFromRetreatEvent } from '@events';
import type { GameStateWithBoard, StandardGameState } from '@game';
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
import { describe, expect, it } from 'vitest';
import { applyTriggerRoutFromRetreatEvent } from './applyTriggerRoutFromRetreatEvent';

/**
 * Illegal retreat: nests a fresh `rout` substep under the existing retreat apply (ranged) or
 * the indicated melee side, preserving retreat metadata until rout resolution runs.
 */
describe('applyTriggerRoutFromRetreatEvent', () => {
  /** issueCommands + ranged retreat substep only (no rout yet). */
  function createStateWithRangedAttackRetreat(): StandardGameState {
    const state = createEmptyGameState();
    const retreatingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      unit: retreatingUnit,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
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

  /** resolveMelee + one-sided retreat apply for the named player. */
  function createStateWithMeleeRetreat(
    retreatingPlayer: 'white' | 'black',
  ): StandardGameState {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const retreatingUnit = createTestUnit(retreatingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(
      retreatingPlayer === 'white' ? 'black' : 'white',
      { attack: 2 },
    );

    const retreatingUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      unit: retreatingUnit,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
    };
    const otherUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      unit: otherUnit,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'south',
      },
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
    const meleeState = createMeleeResolutionState(stateWithUnits, {
      ...(retreatingPlayer === 'white'
        ? { whiteAttackApplyState: attackApplyState }
        : { blackAttackApplyState: attackApplyState }),
    });
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
      const event: TriggerRoutFromRetreatEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'gameEffect',
        effectType: 'triggerRoutFromRetreat',
        retreatResolutionContext: 'rangedAttack',
      };

      const newState = applyTriggerRoutFromRetreatEvent(event, state);
      const newRetreatState = getRetreatStateFromRangedAttack(newState);

      expect(newRetreatState.routState).toBeDefined();
      expect(newRetreatState.routState?.substepType).toBe('rout');
      expect(newRetreatState.routState?.player).toBe(
        retreatState.retreatingUnit.unit.playerSide,
      );
      expect(
        newRetreatState.routState?.unitsToRout.has(
          retreatState.retreatingUnit.unit,
        ),
      ).toBe(true);
    });

    it('given same trigger, new rout has undefined discard count and not completed', () => {
      const state = createStateWithRangedAttackRetreat();

      // Event does not specify player - function determines it from state
      const event: TriggerRoutFromRetreatEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'gameEffect',
        effectType: 'triggerRoutFromRetreat',
        retreatResolutionContext: 'rangedAttack',
      };

      const newState = applyTriggerRoutFromRetreatEvent(event, state);
      const newRetreatState = getRetreatStateFromRangedAttack(newState);

      expect(newRetreatState.routState?.numberToDiscard).toBeUndefined();
      expect(newRetreatState.routState?.cardsChosen).toBe(false);
      expect(newRetreatState.routState?.completed).toBe(false);
    });
  });

  describe('melee retreat context', () => {
    it('given black melee retreat, melee trigger with retreatingPlayer black seeds rout', () => {
      const state = createStateWithMeleeRetreat('black');

      // Event does not specify player - function determines it from state
      const event: TriggerRoutFromRetreatEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'gameEffect',
        effectType: 'triggerRoutFromRetreat',
        retreatResolutionContext: 'melee',
        retreatingPlayer: 'black',
      };

      const newState = applyTriggerRoutFromRetreatEvent(event, state);
      const newRetreatState = getRetreatStateFromMelee(newState, 'black');

      expect(newRetreatState.routState).toBeDefined();
      expect(newRetreatState.routState?.player).toBe('black');
    });

    it('given white melee retreat, melee trigger with retreatingPlayer white seeds rout', () => {
      const state = createStateWithMeleeRetreat('white');

      // Event does not specify player - function determines it from state
      const event: TriggerRoutFromRetreatEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'gameEffect',
        effectType: 'triggerRoutFromRetreat',
        retreatResolutionContext: 'melee',
        retreatingPlayer: 'white',
      };

      const newState = applyTriggerRoutFromRetreatEvent(event, state);
      const newRetreatState = getRetreatStateFromMelee(newState, 'white');

      expect(newRetreatState.routState).toBeDefined();
      expect(newRetreatState.routState?.player).toBe('white');
    });
  });

  describe('structural update', () => {
    it('given retreat routState ref before ranged trigger, input retreat unchanged after apply', () => {
      const state = createStateWithRangedAttackRetreat();
      const retreatState = getRetreatStateFromRangedAttack(state);
      const originalRoutState = retreatState.routState;

      // Event does not specify player - function determines it from state
      const event: TriggerRoutFromRetreatEvent<StandardBoard> = {
        eventNumber: 0,
        eventType: 'gameEffect',
        effectType: 'triggerRoutFromRetreat',
        retreatResolutionContext: 'rangedAttack',
      };

      applyTriggerRoutFromRetreatEvent(event, state);

      expect(retreatState.routState).toBe(originalRoutState);
    });
  });
});
