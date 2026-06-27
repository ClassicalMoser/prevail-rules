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
import { addUnitToBoard, updatePhaseState } from '../';
import { throwIfNone, throwIfPending } from '@utils';

import { updateAttackApplyState } from './updateAttackApplyState';

/**
 * UpdateAttackApplyState: Creates a new game state with the attack apply state updated.
 */
describe(updateAttackApplyState, () => {
  function createStateWithRangedAttackApply() {
    const state = createEmptyGameState();
    const unit = createTestUnit('white', { attack: 2 });
    const placement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
      unit,
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
      blackAttackApplyState: createAttackApplyState(blackUnit),
      whiteAttackApplyState: createAttackApplyState(whiteUnit),
    });
    return updatePhaseState(
      state,
      createResolveMeleePhaseState(state, {
        currentMeleeResolutionState: melee,
      }),
    );
  }

  it('given update attack apply state in ranged attack resolution', () => {
    const state = createStateWithRangedAttackApply();
    const unit = createTestUnit('white', { attack: 2 });
    const updated = createAttackApplyState(unit, { completed: true });

    const newState = updateAttackApplyState(state, updated);

    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('issueCommands');
    if (phase.phase !== 'issueCommands') {
      throw new Error('phase');
    }
    const commandState = throwIfPending(
      phase.currentCommandResolutionState,
      'command',
    );
    expect(commandState.substepType).toBe('commandResolution');
    if (commandState.commandResolutionType !== 'rangedAttack') {
      throw new Error('type');
    }
    const attackApply = throwIfPending(
      commandState.attackApplyState,
      'attack apply',
    );
    expect(attackApply.completed).toBeTruthy();
  });

  it('given update white attack apply state in melee resolution', () => {
    const state = createStateWithMeleeApply();
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const updated = createAttackApplyState(whiteUnit, { completed: true });

    const newState = updateAttackApplyState(state, updated);

    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('resolveMelee');
    if (phase.phase !== 'resolveMelee') {
      throw new Error('phase');
    }
    const melee = throwIfPending(phase.currentMeleeResolutionState, 'melee');
    const whiteApply = throwIfPending(
      melee.whiteAttackApplyState,
      'white apply',
    );
    expect(whiteApply.completed).toBeTruthy();
  });

  it('given update black attack apply state in melee resolution', () => {
    const state = createStateWithMeleeApply();
    const blackUnit = createTestUnit('black', { attack: 2 });
    const updated = createAttackApplyState(blackUnit, { completed: true });

    const newState = updateAttackApplyState(state, updated);

    const phase = throwIfNone(
      newState.currentRoundState.currentPhaseState,
      'phase',
    );
    expect(phase.phase).toBe('resolveMelee');
    if (phase.phase !== 'resolveMelee') {
      throw new Error('phase');
    }
    const melee = throwIfPending(phase.currentMeleeResolutionState, 'melee');
    const blackApply = throwIfPending(
      melee.blackAttackApplyState,
      'black apply',
    );
    expect(blackApply.completed).toBeTruthy();
  });

  it('given when ranged attack resolution has no attack apply state, throws', () => {
    const state = createEmptyGameState();
    const ranged = createRangedAttackResolutionState(state, {
      attackApplyState: 'pending',
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

  it('given when not in issueCommands or resolveMelee phase, throws', () => {
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
