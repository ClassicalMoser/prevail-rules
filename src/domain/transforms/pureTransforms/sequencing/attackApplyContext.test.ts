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
import {
  getAttackApplyStateFromContext,
  updateAttackApplySubstep,
} from './attackApplyContext';

/**
 * getAttackApplyStateFromContext: Gets the attack apply state from the current game state context.
 */
describe('getAttackApplyStateFromContext', () => {
  function createStateWithRangedAttack() {
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
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: createRangedAttackResolutionState(
        stateWithUnit,
        {
          attackApplyState: attackApply,
        },
      ),
    });
    return updatePhaseState(stateWithUnit, phaseState);
  }

  function createStateWithMelee() {
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

  it('given context, returns attack apply state in issueCommands with ranged attack', () => {
    const state = createStateWithRangedAttack();
    const result = getAttackApplyStateFromContext(state);
    expect(result.defendingUnit.playerSide).toBe('white');
    expect(result.substepType).toBe('attackApply');
  });

  it('given player is white, returns white attack apply state in resolveMelee', () => {
    const state = createStateWithMelee();
    const result = getAttackApplyStateFromContext(state, 'white');
    expect(result.defendingUnit.playerSide).toBe('white');
  });

  it('given player is black, returns black attack apply state in resolveMelee', () => {
    const state = createStateWithMelee();
    const result = getAttackApplyStateFromContext(state, 'black');
    expect(result.defendingUnit.playerSide).toBe('black');
  });

  it('given in resolveMelee when player is not provided, throws', () => {
    const state = createStateWithMelee();
    expect(() => getAttackApplyStateFromContext(state)).toThrow(
      'Player parameter required for melee attack apply state context',
    );
  });

  it('given when not in issueCommands or resolveMelee phase, throws', () => {
    const state = createEmptyGameState();
    const stateInPlayCards = updatePhaseState(
      state,
      createPlayCardsPhaseState(),
    );
    expect(() => getAttackApplyStateFromContext(stateInPlayCards)).toThrow(
      'Attack apply state not available in phase: playCards',
    );
  });
});

describe('updateAttackApplySubstep', () => {
  function createStateWithRangedAttack() {
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
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: createRangedAttackResolutionState(
        stateWithUnit,
        {
          attackApplyState: attackApply,
        },
      ),
    });
    return updatePhaseState(stateWithUnit, phaseState);
  }

  function createStateWithMelee() {
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

  it('given update attack apply state in ranged attack context', () => {
    const state = createStateWithRangedAttack();
    const newState = updateAttackApplySubstep(
      state,
      (aa) => ({ ...aa, completed: true }),
      () => 'white',
      {},
    );
    const phase = newState.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe('issueCommands');
    if (
      phase?.phase !== 'issueCommands' ||
      !phase.currentCommandResolutionState
    )
      throw new Error('phase');
    if (
      phase.currentCommandResolutionState.commandResolutionType !==
      'rangedAttack'
    )
      throw new Error('type');
    expect(
      phase.currentCommandResolutionState.attackApplyState?.completed,
    ).toBe(true);
  });

  it('given update correct player attack apply state in melee context', () => {
    const state = createStateWithMelee();
    const newState = updateAttackApplySubstep(
      state,
      (aa) => ({ ...aa, completed: true }),
      () => 'black',
      {},
    );
    const phase = newState.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe('resolveMelee');
    if (phase?.phase !== 'resolveMelee') throw new Error('phase');
    expect(
      phase.currentMeleeResolutionState?.blackAttackApplyState?.completed,
    ).toBe(true);
    expect(
      phase.currentMeleeResolutionState?.whiteAttackApplyState?.completed,
    ).toBe(false);
  });

  it('given when not in issueCommands or resolveMelee phase, throws', () => {
    const state = createEmptyGameState();
    const stateInPlayCards = updatePhaseState(
      state,
      createPlayCardsPhaseState(),
    );
    expect(() =>
      updateAttackApplySubstep(
        stateInPlayCards,
        (aa) => aa,
        () => 'white',
        {},
      ),
    ).toThrow('Attack apply substep update not expected in phase: playCards');
  });
});
