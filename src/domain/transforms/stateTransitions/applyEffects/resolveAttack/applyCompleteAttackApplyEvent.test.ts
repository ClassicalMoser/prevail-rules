import type { AttackType, StandardBoard, UnitWithPlacement } from '@entities';
import type { CompleteAttackApplyEvent } from '@events';
import type { GameStateForBoard } from '@game';
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
import { throwIfPending } from '@utils';

import { applyCompleteAttackApplyEvent } from './applyCompleteAttackApplyEvent';

/**
 * Marks the active attack-apply substep finished for the defending player named in the event
 * (ranged single apply vs melee side chosen by initiative order).
 */
describe(applyCompleteAttackApplyEvent, () => {
  /** IssueCommands + ranged CRS + incomplete apply for white defender on E-5. */
  function createStateWithRangedAttackApply(): GameStateForBoard<StandardBoard> {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: defendingUnit,
    };

    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };

    const attackApplyState = createAttackApplyState(defendingUnit);
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
  ): GameStateForBoard<StandardBoard> {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });

    const whiteUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: whiteUnit,
    };
    const blackUnitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'south',
      },
      unit: blackUnit,
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
      blackAttackApplyState: blackAttackApply,
      whiteAttackApplyState: whiteAttackApply,
    });
    const phaseState = createResolveMeleePhaseState(stateWithUnits, {
      currentMeleeResolutionState: meleeState,
    });

    return updatePhaseState(stateWithUnits, phaseState);
  }

  describe('ranged apply', () => {
    it('given incomplete ranged apply, event defending white sets completed true', () => {
      const state = createStateWithRangedAttackApply();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      expect(attackApplyState.completed).toBeFalsy();

      const event: CompleteAttackApplyEvent = {
        attackType: 'ranged',
        defendingPlayer: 'white',
        effectType: 'completeAttackApply',
        eventNumber: 0,
        eventType: 'gameEffect',
      };

      const newState = applyCompleteAttackApplyEvent(event, state);
      const newAttackApplyState = getAttackApplyStateFromRangedAttack(newState);

      expect(newAttackApplyState.completed).toBeTruthy();
    });

    it('given same completion, substepType defendingUnit and attackResult unchanged besides completed', () => {
      const state = createStateWithRangedAttackApply();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);

      const event: CompleteAttackApplyEvent = {
        attackType: 'ranged',
        defendingPlayer: 'white',
        effectType: 'completeAttackApply',
        eventNumber: 0,
        eventType: 'gameEffect',
      };

      const newState = applyCompleteAttackApplyEvent(event, state);
      const newAttackApplyState = getAttackApplyStateFromRangedAttack(newState);

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
          ? meleeState.whiteAttackApplyState
          : meleeState.blackAttackApplyState;

      expect(
        throwIfPending(firstPlayerAttackApply, 'apply').completed,
      ).toBeFalsy();

      const event: CompleteAttackApplyEvent = {
        attackType: 'melee',
        defendingPlayer: 'black',
        effectType: 'completeAttackApply',
        eventNumber: 0,
        eventType: 'gameEffect',
      };

      const newState = applyCompleteAttackApplyEvent(event, state);
      const newMeleeState = getMeleeResolutionState(newState);
      const newFirstPlayerAttackApply =
        firstPlayer === 'white'
          ? newMeleeState.whiteAttackApplyState
          : newMeleeState.blackAttackApplyState;

      expect(
        throwIfPending(newFirstPlayerAttackApply, 'apply').completed,
      ).toBeTruthy();
    });

    it('given white apply still incomplete after black done, event for white completes white apply', () => {
      const state = createStateWithMeleeApply('white');
      const meleeState = getMeleeResolutionState(state);
      const firstPlayer = state.currentInitiative;
      const secondPlayer = firstPlayer === 'white' ? 'black' : 'white';
      const secondPlayerAttackApply =
        secondPlayer === 'white'
          ? meleeState.whiteAttackApplyState
          : meleeState.blackAttackApplyState;

      expect(
        throwIfPending(secondPlayerAttackApply, 'apply').completed,
      ).toBeFalsy();

      const event: CompleteAttackApplyEvent = {
        attackType: 'melee',
        defendingPlayer: 'white',
        effectType: 'completeAttackApply',
        eventNumber: 0,
        eventType: 'gameEffect',
      };

      const newState = applyCompleteAttackApplyEvent(event, state);
      const newMeleeState = getMeleeResolutionState(newState);
      const newSecondPlayerAttackApply =
        secondPlayer === 'white'
          ? newMeleeState.whiteAttackApplyState
          : newMeleeState.blackAttackApplyState;

      expect(
        throwIfPending(newSecondPlayerAttackApply, 'apply').completed,
      ).toBeTruthy();
    });
  });

  describe('structural update', () => {
    it('given ranged apply completed false before apply, input apply object unchanged after apply', () => {
      const state = createStateWithRangedAttackApply();
      const attackApplyState = getAttackApplyStateFromRangedAttack(state);
      const originalCompleted = attackApplyState.completed;

      const event: CompleteAttackApplyEvent = {
        attackType: 'ranged',
        defendingPlayer: 'white',
        effectType: 'completeAttackApply',
        eventNumber: 0,
        eventType: 'gameEffect',
      };

      applyCompleteAttackApplyEvent(event, state);

      expect(attackApplyState.completed).toBe(originalCompleted);
    });
  });

  describe('errors', () => {
    it('given melee missing whiteAttackApplyState, complete for white throws no white apply', () => {
      const state = createStateWithMeleeApply('black');
      const meleeState = getMeleeResolutionState(state);
      const phaseState = createResolveMeleePhaseState(state, {
        currentMeleeResolutionState: {
          ...meleeState,
          whiteAttackApplyState: 'pending',
        },
      });
      const stateMissingWhiteApply = updatePhaseState(state, phaseState);

      const event: CompleteAttackApplyEvent = {
        attackType: 'melee',
        defendingPlayer: 'white',
        effectType: 'completeAttackApply',
        eventNumber: 0,
        eventType: 'gameEffect',
      };

      expect(() =>
        applyCompleteAttackApplyEvent(event, stateMissingWhiteApply),
      ).toThrow('No white attack apply state found in melee resolution');
    });

    it('given attackType siege cast, throws unknown attack type for completeAttackApply', () => {
      const state = createEmptyGameState();
      const event: CompleteAttackApplyEvent = {
        eventNumber: 0,
        eventType: 'gameEffect' as const,
        effectType: 'completeAttackApply',
        // Intentionally bad cast to test failure path
        attackType: 'siege' as unknown as AttackType,
        defendingPlayer: 'white',
      };

      expect(() => applyCompleteAttackApplyEvent(event, state)).toThrow(
        'Unknown attack type for completeAttackApply: siege',
      );
    });
  });
});
