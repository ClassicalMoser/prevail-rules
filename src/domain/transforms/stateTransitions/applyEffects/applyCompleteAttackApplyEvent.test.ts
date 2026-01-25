import type { GameState, StandardBoard, UnitWithPlacement } from '@entities';
import type { CompleteAttackApplyEvent } from '@events';
import {
  getAttackApplyStateFromRangedAttack,
  getMeleeResolutionState,
} from '@queries';
import {
  createAttackApplyState,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyCompleteAttackApplyEvent } from './applyCompleteAttackApplyEvent';

describe('applyCompleteAttackApplyEvent', () => {
  /**
   * Helper to create a game state with an incomplete attack apply state in ranged attack resolution
   */
  function createStateWithRangedAttackApply(): GameState<StandardBoard> {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: defendingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };

    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };

    const attackApplyState = createAttackApplyState(defendingUnit, {
      completed: false,
    });
    const rangedAttackState = createRangedAttackResolutionState(stateWithUnit, {
      attackApplyState,
    });
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: rangedAttackState,
    });

    return updatePhaseState(stateWithUnit, phaseState);
  }

  /**
   * Helper to create a game state with incomplete attack apply states in melee resolution
   */
  function createStateWithMeleeApply(
    incompletePlayer?: 'white' | 'black',
  ): GameState<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });

    const whiteUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: whiteUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const blackUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: blackUnit,
      placement: { coordinate: 'E-5', facing: 'south' },
    };

    let stateWithUnits = {
      ...state,
      boardState: addUnitToBoard(state.boardState, whiteUnitWithPlacement),
    };
    stateWithUnits = {
      ...stateWithUnits,
      boardState: addUnitToBoard(
        stateWithUnits.boardState,
        blackUnitWithPlacement,
      ),
    };

    const whiteAttackApply = createAttackApplyState(whiteUnit, {
      completed: incompletePlayer !== 'white',
    });
    const blackAttackApply = createAttackApplyState(blackUnit, {
      completed: incompletePlayer !== 'black',
    });

    const meleeState = createMeleeResolutionState(stateWithUnits, {
      whiteAttackApplyState: whiteAttackApply,
      blackAttackApplyState: blackAttackApply,
    });
    const phaseState = createResolveMeleePhaseState(stateWithUnits, {
      currentMeleeResolutionState: meleeState,
    });

    return updatePhaseState(stateWithUnits, phaseState);
  }

  describe('ranged attack resolution context', () => {
    it('should mark attack apply state as completed', () => {
      const state = createStateWithRangedAttackApply();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      expect(attackApplyState.completed).toBe(false);

      const event: CompleteAttackApplyEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeAttackApply',
      };

      const newState = applyCompleteAttackApplyEvent(event, state);
      const newAttackApplyState = getAttackApplyStateFromRangedAttack(newState);

      expect(newAttackApplyState.completed).toBe(true);
    });

    it('should preserve other attack apply state properties', () => {
      const state = createStateWithRangedAttackApply();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);

      const event: CompleteAttackApplyEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeAttackApply',
      };

      const newState = applyCompleteAttackApplyEvent(event, state);
      const newAttackApplyState = getAttackApplyStateFromRangedAttack(newState);

      expect(newAttackApplyState.substepType).toBe('attackApply');
      expect(newAttackApplyState.defendingUnit).toEqual(
        attackApplyState.defendingUnit,
      );
      expect(newAttackApplyState.attackResult).toEqual(
        attackApplyState.attackResult,
      );
    });
  });

  describe('melee resolution context', () => {
    it('should mark first player attack apply state as completed', () => {
      const state = createStateWithMeleeApply('black');
      const meleeState = getMeleeResolutionState(state);
      const firstPlayer = state.currentInitiative;
      const firstPlayerAttackApply =
        firstPlayer === 'white'
          ? meleeState.whiteAttackApplyState
          : meleeState.blackAttackApplyState;

      expect(firstPlayerAttackApply?.completed).toBe(false);

      const event: CompleteAttackApplyEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeAttackApply',
      };

      const newState = applyCompleteAttackApplyEvent(event, state);
      const newMeleeState = getMeleeResolutionState(newState);
      const newFirstPlayerAttackApply =
        firstPlayer === 'white'
          ? newMeleeState.whiteAttackApplyState
          : newMeleeState.blackAttackApplyState;

      expect(newFirstPlayerAttackApply?.completed).toBe(true);
    });

    it('should mark second player attack apply state as completed when first is already complete', () => {
      const state = createStateWithMeleeApply('white');
      const meleeState = getMeleeResolutionState(state);
      const firstPlayer = state.currentInitiative;
      const secondPlayer = firstPlayer === 'white' ? 'black' : 'white';
      const secondPlayerAttackApply =
        secondPlayer === 'white'
          ? meleeState.whiteAttackApplyState
          : meleeState.blackAttackApplyState;

      expect(secondPlayerAttackApply?.completed).toBe(false);

      const event: CompleteAttackApplyEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeAttackApply',
      };

      const newState = applyCompleteAttackApplyEvent(event, state);
      const newMeleeState = getMeleeResolutionState(newState);
      const newSecondPlayerAttackApply =
        secondPlayer === 'white'
          ? newMeleeState.whiteAttackApplyState
          : newMeleeState.blackAttackApplyState;

      expect(newSecondPlayerAttackApply?.completed).toBe(true);
    });

    it('should throw if both attack apply states are already completed', () => {
      const state = createStateWithMeleeApply();

      const event: CompleteAttackApplyEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeAttackApply',
      };

      expect(() => applyCompleteAttackApplyEvent(event, state)).toThrow(
        'No incomplete attack apply state found in melee resolution',
      );
    });
  });

  describe('immutability', () => {
    it('should not mutate the original state', () => {
      const state = createStateWithRangedAttackApply();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      const originalCompleted = attackApplyState.completed;

      const event: CompleteAttackApplyEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeAttackApply',
      };

      applyCompleteAttackApplyEvent(event, state);

      expect(attackApplyState.completed).toBe(originalCompleted);
    });
  });

  describe('error cases', () => {
    it('should throw if not in issueCommands or resolveMelee phase', () => {
      const state = createEmptyGameState();

      const event: CompleteAttackApplyEvent<StandardBoard> = {
        eventType: 'gameEffect',
        effectType: 'completeAttackApply',
      };

      expect(() => applyCompleteAttackApplyEvent(event, state)).toThrow(
        'No current phase state found',
      );
    });
  });
});
