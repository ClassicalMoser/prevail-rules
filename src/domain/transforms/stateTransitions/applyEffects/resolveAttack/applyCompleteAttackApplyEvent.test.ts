import type { AttackType } from '@entities';
import type { CompleteAttackApplyEvent } from '@events';
import type { GameState } from '@game';
import { getRangedAttackApplyState, getMeleeResolutionState } from '@queries';
import {
  createAttackApplyStateWithNothingDue,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';
import { throwIfPending } from '@utils';

import { applyCompleteAttackApplyEvent } from './applyCompleteAttackApplyEvent';

import { createEmptyGameState } from '@factories';
/**
 * Marks the active attack-apply substep finished for the defending player named in the event
 * (ranged single apply vs melee side chosen by initiative order).
 */
describe('applyCompleteAttackApplyEvent function', () => {
  /** IssueCommands + ranged CRS + incomplete apply for white defender on E-5. */
  function createStateWithRangedAttackApply(): GameState {
    const state = createEmptyGameState('standard');
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(defendingUnit, 'E-5', 'north');

    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };

    const attackApplyState =
      createAttackApplyStateWithNothingDue(defendingUnit);
    const rangedAttackState = createRangedAttackResolutionState(stateWithUnit, {
      attackApplyState,
    });
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: rangedAttackState,
    });

    return updatePhaseState(stateWithUnit, phaseState);
  }

  /** ResolveMelee + two applies; pass side still incomplete or omit for both complete. */
  function createStateWithMeleeApply(
    incompletePlayer?: 'white' | 'black',
  ): GameState {
    const state = createEmptyGameState('standard');
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });

    const whiteUnitWithPlacement = placed(whiteUnit, 'E-5', 'north');
    const blackUnitWithPlacement = placed(blackUnit, 'E-5', 'south');

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

    const whiteAttackApply = createAttackApplyStateWithNothingDue(whiteUnit, {
      completed: incompletePlayer !== 'white',
    });
    const blackAttackApply = createAttackApplyStateWithNothingDue(blackUnit, {
      completed: incompletePlayer !== 'black',
    });

    const meleeState = createMeleeResolutionState(stateWithUnits, {
      firstPlayerAttackApplyState: blackAttackApply,
      secondPlayerAttackApplyState: whiteAttackApply,
    });
    const phaseState = createResolveMeleePhaseState(stateWithUnits, {
      currentMeleeResolutionState: meleeState,
    });

    return updatePhaseState(stateWithUnits, phaseState);
  }

  describe('ranged apply', () => {
    it('given incomplete ranged apply, event defending white sets completed true', () => {
      const state = createStateWithRangedAttackApply();
      const attackApplyState = getRangedAttackApplyState(state);
      expect(attackApplyState.completed).toBe(false);

      const event: CompleteAttackApplyEvent = {
        attackType: 'ranged',
        defendingPlayer: 'white',
        effectType: 'completeAttackApply',
        eventType: 'gameEffect',
      };

      const newState = applyCompleteAttackApplyEvent(event, state);
      const newAttackApplyState = getRangedAttackApplyState(newState);

      expect(newAttackApplyState.completed).toBe(true);
    });

    it('given same completion, substepType defendingUnit and attackResult unchanged besides completed', () => {
      const state = createStateWithRangedAttackApply();
      const attackApplyState = getRangedAttackApplyState(state);

      const event: CompleteAttackApplyEvent = {
        attackType: 'ranged',
        defendingPlayer: 'white',
        effectType: 'completeAttackApply',
        eventType: 'gameEffect',
      };

      const newState = applyCompleteAttackApplyEvent(event, state);
      const newAttackApplyState = getRangedAttackApplyState(newState);

      expect(newAttackApplyState.substepType).toBe('attackApply');
      expect(newAttackApplyState.defendingUnit).toStrictEqual(
        attackApplyState.defendingUnit,
      );
      expect(newAttackApplyState.attackResult).toStrictEqual(
        attackApplyState.attackResult,
      );
    });
  });

  describe('melee apply', () => {
    it('given black initiative and black apply incomplete, completeAttackApply for black marks that side', () => {
      const state = createStateWithMeleeApply('black');
      const meleeState = getMeleeResolutionState(state);
      const firstPlayer = state.currentInitiative;
      const firstPlayerAttackApply =
        firstPlayer === 'white'
          ? meleeState.secondPlayerAttackApplyState
          : meleeState.firstPlayerAttackApplyState;

      expect(throwIfPending(firstPlayerAttackApply, 'apply').completed).toBe(
        false,
      );

      const event: CompleteAttackApplyEvent = {
        attackType: 'melee',
        defendingPlayer: 'black',
        effectType: 'completeAttackApply',
        eventType: 'gameEffect',
      };

      const newState = applyCompleteAttackApplyEvent(event, state);
      const newMeleeState = getMeleeResolutionState(newState);
      const newFirstPlayerAttackApply =
        firstPlayer === 'white'
          ? newMeleeState.secondPlayerAttackApplyState
          : newMeleeState.firstPlayerAttackApplyState;

      expect(throwIfPending(newFirstPlayerAttackApply, 'apply').completed).toBe(
        true,
      );
    });

    it('given white apply still incomplete after black done, event for white completes white apply', () => {
      const state = createStateWithMeleeApply('white');
      const meleeState = getMeleeResolutionState(state);
      const firstPlayer = state.currentInitiative;
      const secondPlayer = firstPlayer === 'white' ? 'black' : 'white';
      const secondPlayerAttackApply =
        secondPlayer === 'white'
          ? meleeState.secondPlayerAttackApplyState
          : meleeState.firstPlayerAttackApplyState;

      expect(throwIfPending(secondPlayerAttackApply, 'apply').completed).toBe(
        false,
      );

      const event: CompleteAttackApplyEvent = {
        attackType: 'melee',
        defendingPlayer: 'white',
        effectType: 'completeAttackApply',
        eventType: 'gameEffect',
      };

      const newState = applyCompleteAttackApplyEvent(event, state);
      const newMeleeState = getMeleeResolutionState(newState);
      const newSecondPlayerAttackApply =
        secondPlayer === 'white'
          ? newMeleeState.secondPlayerAttackApplyState
          : newMeleeState.firstPlayerAttackApplyState;

      expect(
        throwIfPending(newSecondPlayerAttackApply, 'apply').completed,
      ).toBe(true);
    });
  });

  describe('structural update', () => {
    it('given ranged apply completed false before apply, input apply object unchanged after apply', () => {
      const state = createStateWithRangedAttackApply();
      const attackApplyState = getRangedAttackApplyState(state);
      const originalCompleted = attackApplyState.completed;

      const event: CompleteAttackApplyEvent = {
        attackType: 'ranged',
        defendingPlayer: 'white',
        effectType: 'completeAttackApply',
        eventType: 'gameEffect',
      };

      applyCompleteAttackApplyEvent(event, state);

      expect(attackApplyState.completed).toBe(originalCompleted);
    });
  });

  describe('errors', () => {
    it('given melee missing secondPlayerAttackApplyState, complete for white throws no white apply', () => {
      const state = createStateWithMeleeApply('black');
      const meleeState = getMeleeResolutionState(state);
      const phaseState = createResolveMeleePhaseState(state, {
        currentMeleeResolutionState: {
          ...meleeState,
          secondPlayerAttackApplyState: 'pending',
        },
      });
      const stateMissingWhiteApply = updatePhaseState(state, phaseState);

      const event: CompleteAttackApplyEvent = {
        attackType: 'melee',
        defendingPlayer: 'white',
        effectType: 'completeAttackApply',
        eventType: 'gameEffect',
      };

      expect(() =>
        applyCompleteAttackApplyEvent(event, stateMissingWhiteApply),
      ).toThrow('No white attack apply state found in melee resolution');
    });

    it('given attackType siege cast, throws unknown attack type for completeAttackApply', () => {
      const state = createEmptyGameState('standard');
      const event: CompleteAttackApplyEvent = {
        eventType: 'gameEffect' as const,
        effectType: 'completeAttackApply',
        // Intentionally bad type cast to test error path
        attackType: 'siege' as unknown as AttackType,
        defendingPlayer: 'white',
      };

      expect(() => applyCompleteAttackApplyEvent(event, state)).toThrow(
        'Unknown attack type for completeAttackApply: siege',
      );
    });
  });
});
