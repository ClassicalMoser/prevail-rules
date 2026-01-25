import type { GameState, StandardBoard, UnitWithPlacement } from '@entities';
import type { TriggerRoutFromRetreatEvent } from '@events';
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

describe('applyTriggerRoutFromRetreatEvent', () => {
  /**
   * Helper to create a game state with a retreat state in ranged attack resolution
   */
  function createStateWithRangedAttackRetreat(): GameState<StandardBoard> {
    const state = createEmptyGameState();
    const retreatingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: retreatingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
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

  /**
   * Helper to create a game state with a retreat state in melee resolution
   */
  function createStateWithMeleeRetreat(
    retreatingPlayer: 'white' | 'black',
  ): GameState<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const retreatingUnit = createTestUnit(retreatingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(
      retreatingPlayer === 'white' ? 'black' : 'white',
      { attack: 2 },
    );

    const retreatingUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: retreatingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const otherUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: otherUnit,
      placement: { coordinate: 'E-5', facing: 'south' },
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

  describe('ranged attack resolution context', () => {
    it('should create rout state in retreat state', () => {
      const state = createStateWithRangedAttackRetreat();
      const retreatState = getRetreatStateFromRangedAttack(state);

      // Event does not specify player - function determines it from state
      const event: TriggerRoutFromRetreatEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'triggerRoutFromRetreat',
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

    it('should set rout state properties correctly', () => {
      const state = createStateWithRangedAttackRetreat();

      // Event does not specify player - function determines it from state
      const event: TriggerRoutFromRetreatEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'triggerRoutFromRetreat',
      };

      const newState = applyTriggerRoutFromRetreatEvent(event, state);
      const newRetreatState = getRetreatStateFromRangedAttack(newState);

      expect(newRetreatState.routState?.numberToDiscard).toBeUndefined();
      expect(newRetreatState.routState?.cardsChosen).toBe(false);
      expect(newRetreatState.routState?.completed).toBe(false);
    });
  });

  describe('melee resolution context', () => {
    it('should create rout state in retreat state for first player', () => {
      const state = createStateWithMeleeRetreat('black');

      // Event does not specify player - function determines it from state
      const event: TriggerRoutFromRetreatEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'triggerRoutFromRetreat',
      };

      const newState = applyTriggerRoutFromRetreatEvent(event, state);
      const newRetreatState = getRetreatStateFromMelee(newState, 'black');

      expect(newRetreatState.routState).toBeDefined();
      expect(newRetreatState.routState?.player).toBe('black');
    });

    it('should create rout state in retreat state for second player', () => {
      const state = createStateWithMeleeRetreat('white');

      // Event does not specify player - function determines it from state
      const event: TriggerRoutFromRetreatEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'triggerRoutFromRetreat',
      };

      const newState = applyTriggerRoutFromRetreatEvent(event, state);
      const newRetreatState = getRetreatStateFromMelee(newState, 'white');

      expect(newRetreatState.routState).toBeDefined();
      expect(newRetreatState.routState?.player).toBe('white');
    });
  });

  describe('immutability', () => {
    it('should not mutate the original state', () => {
      const state = createStateWithRangedAttackRetreat();
      const retreatState = getRetreatStateFromRangedAttack(state);
      const originalRoutState = retreatState.routState;

      // Event does not specify player - function determines it from state
      const event: TriggerRoutFromRetreatEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'triggerRoutFromRetreat',
      };

      applyTriggerRoutFromRetreatEvent(event, state);

      expect(retreatState.routState).toBe(originalRoutState);
    });
  });
});
