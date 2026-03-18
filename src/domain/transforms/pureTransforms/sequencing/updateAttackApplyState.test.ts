import type { StandardBoard, UnitWithPlacement } from '@entities';
import {
  createAttackApplyState,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { updateAttackApplyState } from './updateAttackApplyState';

describe('updateAttackApplyState', () => {
  function createStateWithRangedAttackApply() {
    const state = createEmptyGameState();
    const unit = createTestUnit('white', { attack: 2 });
    const placement: UnitWithPlacement<StandardBoard> = {
      unit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, placement),
    };
    const attackApply = createAttackApplyState(unit);
    const ranged = createRangedAttackResolutionState(stateWithUnit, {
      attackApplyState: attackApply,
    });
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(stateWithUnit, phaseState);
  }

  function createStateWithMeleeApply() {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const melee = createMeleeResolutionState(state, {
      whiteAttackApplyState: createAttackApplyState(whiteUnit),
      blackAttackApplyState: createAttackApplyState(blackUnit),
    });
    return updatePhaseState(
      state,
      createResolveMeleePhaseState(state, {
        currentMeleeResolutionState: melee,
      }),
    );
  }

  it('should update attack apply state in ranged attack resolution', () => {
    const state = createStateWithRangedAttackApply();
    const unit = createTestUnit('white', { attack: 2 });
    const updated = createAttackApplyState(unit, { completed: true });

    const newState = updateAttackApplyState(state, updated);

    const phase = newState.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe('issueCommands');
    if (
      phase?.phase !== 'issueCommands' ||
      !phase.currentCommandResolutionState
    )
      throw new Error('phase');
    expect(phase.currentCommandResolutionState.substepType).toBe(
      'commandResolution',
    );
    if (
      phase.currentCommandResolutionState.commandResolutionType !==
      'rangedAttack'
    )
      throw new Error('type');
    expect(
      phase.currentCommandResolutionState.attackApplyState?.completed,
    ).toBe(true);
  });

  it('should update white attack apply state in melee resolution', () => {
    const state = createStateWithMeleeApply();
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const updated = createAttackApplyState(whiteUnit, { completed: true });

    const newState = updateAttackApplyState(state, updated);

    const phase = newState.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe('resolveMelee');
    if (phase?.phase !== 'resolveMelee') throw new Error('phase');
    expect(
      phase.currentMeleeResolutionState?.whiteAttackApplyState?.completed,
    ).toBe(true);
  });

  it('should update black attack apply state in melee resolution', () => {
    const state = createStateWithMeleeApply();
    const blackUnit = createTestUnit('black', { attack: 2 });
    const updated = createAttackApplyState(blackUnit, { completed: true });

    const newState = updateAttackApplyState(state, updated);

    const phase = newState.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe('resolveMelee');
    if (phase?.phase !== 'resolveMelee') throw new Error('phase');
    expect(
      phase.currentMeleeResolutionState?.blackAttackApplyState?.completed,
    ).toBe(true);
  });

  it('should throw when ranged attack resolution has no attack apply state', () => {
    const state = createEmptyGameState();
    const ranged = createRangedAttackResolutionState(state, {
      attackApplyState: undefined,
    });
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: ranged,
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const unit = createTestUnit('white', { attack: 2 });

    expect(() =>
      updateAttackApplyState(stateInPhase, createAttackApplyState(unit)),
    ).toThrow('No attack apply state found in ranged attack resolution state');
  });

  it('should throw when not in issueCommands or resolveMelee phase', () => {
    const state = createEmptyGameState();
    const stateInPlayCards = updatePhaseState(
      state,
      createPlayCardsPhaseState(),
    );
    const unit = createTestUnit('white', { attack: 2 });

    expect(() =>
      updateAttackApplyState(stateInPlayCards, createAttackApplyState(unit)),
    ).toThrow('Attack apply state update not expected in phase: playCards');
  });
});
