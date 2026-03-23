import type { GameState, StandardBoard, UnitWithPlacement } from '@entities';
import {
  createAttackApplyState,
  createCleanupPhaseState,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';
import { generateCompleteAttackApplyEvent } from './generateCompleteAttackApplyEvent';

describe('generateCompleteAttackApplyEvent', () => {
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

    const attackApplyState = createAttackApplyState(defendingUnit);
    const rangedAttackState = createRangedAttackResolutionState(stateWithUnit, {
      attackApplyState,
    });
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: rangedAttackState,
    });

    return updatePhaseState(stateWithUnit, phaseState);
  }

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

  it('should generate ranged completeAttackApply with defending player from state', () => {
    const state = createStateWithRangedAttackApply();

    expect(generateCompleteAttackApplyEvent(state)).toEqual({
      eventType: 'gameEffect',
      effectType: 'completeAttackApply',
      attackType: 'ranged',
      defendingPlayer: 'white',
    });
  });

  it('should generate melee completeAttackApply for initiative player when their apply is incomplete', () => {
    const state = createStateWithMeleeApply('black');

    expect(generateCompleteAttackApplyEvent(state)).toEqual({
      eventType: 'gameEffect',
      effectType: 'completeAttackApply',
      attackType: 'melee',
      defendingPlayer: 'black',
    });
  });

  it('should generate melee completeAttackApply for second player when first is already complete', () => {
    const state = createStateWithMeleeApply('white');

    expect(generateCompleteAttackApplyEvent(state)).toEqual({
      eventType: 'gameEffect',
      effectType: 'completeAttackApply',
      attackType: 'melee',
      defendingPlayer: 'white',
    });
  });

  it('should throw when no incomplete melee attack apply exists', () => {
    const state = createStateWithMeleeApply();

    expect(() => generateCompleteAttackApplyEvent(state)).toThrow(
      'No incomplete attack apply state found in melee resolution',
    );
  });

  it('should throw when there is no current phase state', () => {
    const state = createEmptyGameState();

    expect(() => generateCompleteAttackApplyEvent(state)).toThrow(
      'No current phase state found',
    );
  });

  it('should throw when phase is not issueCommands or resolveMelee', () => {
    const base = createEmptyGameState();
    const full = updatePhaseState(base, createCleanupPhaseState());
    expect(() => generateCompleteAttackApplyEvent(full)).toThrow(
      'completeAttackApply not expected in phase: cleanup',
    );
  });
});
