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
import {
  addUnitToBoard,
  updateCurrentInitiative,
  updatePhaseState,
} from '@transforms/pureTransforms';
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
    incompletePlayer?: 'white' | 'black' | 'both',
  ): GameState {
    // Black holds the initiative here, so black's apply is the first player's.
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
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
      completed: incompletePlayer !== 'white' && incompletePlayer !== 'both',
    });
    const blackAttackApply = createAttackApplyStateWithNothingDue(blackUnit, {
      completed: incompletePlayer !== 'black' && incompletePlayer !== 'both',
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
    it('closes the one apply of a shot', () => {
      const state = createStateWithRangedAttackApply();
      const attackApplyState = getRangedAttackApplyState(state);
      expect(attackApplyState.completed).toBe(false);

      const event: CompleteAttackApplyEvent = {
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
    it('closes the melee apply left open, when it is black’s', () => {
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

    it('with both melee applies open, closes the second player’s first', () => {
      // Black strikes first, so white's unit suffers first and its apply is
      // the first to close (§7.5.6).
      const state = createStateWithMeleeApply('both');

      const newState = applyCompleteAttackApplyEvent(
        { effectType: 'completeAttackApply', eventType: 'gameEffect' },
        state,
      );

      const melee = getMeleeResolutionState(newState);
      expect(
        throwIfPending(melee.secondPlayerAttackApplyState, 'apply').completed,
      ).toBe(true);
      expect(
        throwIfPending(melee.firstPlayerAttackApplyState, 'apply').completed,
      ).toBe(false);
    });

    it('closes the melee apply left open, when it is white’s', () => {
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
        effectType: 'completeAttackApply',
        eventType: 'gameEffect',
      };

      applyCompleteAttackApplyEvent(event, state);

      expect(attackApplyState.completed).toBe(originalCompleted);
    });
  });

  describe('errors', () => {
    it('throws when one side’s melee apply is not written yet', () => {
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
        effectType: 'completeAttackApply',
        eventType: 'gameEffect',
      };

      expect(() =>
        applyCompleteAttackApplyEvent(event, stateMissingWhiteApply),
      ).toThrow(
        'A melee attack apply has not been written yet, so none can close',
      );
    });
  });
});
