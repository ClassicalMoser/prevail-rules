import type { StandardBoard, UnitWithPlacement } from '@entities';
import {
  createAttackApplyState,
  createAttackApplyStateWithReverse,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createReverseState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { updateReverseState } from './updateReverseState';

/**
 * updateReverseState: Creates a new game state with the reverse state updated in an attack apply state.
 */
describe('updateReverseState', () => {
  function createStateWithRangedAttackReverse() {
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
    const attackApply = createAttackApplyStateWithReverse(placement);
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

  function createStateWithMeleeReverse(reversingPlayer: 'white' | 'black') {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const reversingUnit = createTestUnit(reversingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(
      reversingPlayer === 'white' ? 'black' : 'white',
      { attack: 2 },
    );
    const reversingPlacement: UnitWithPlacement<StandardBoard> = {
      unit: reversingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const otherPlacement: UnitWithPlacement<StandardBoard> = {
      unit: otherUnit,
      placement: { coordinate: 'E-5', facing: 'south' },
    };
    let stateWithUnits = {
      ...state,
      boardState: addUnitToBoard(state.boardState, reversingPlacement),
    };
    stateWithUnits = {
      ...stateWithUnits,
      boardState: addUnitToBoard(stateWithUnits.boardState, otherPlacement),
    };
    const attackApply = createAttackApplyStateWithReverse(reversingPlacement);
    const melee = createMeleeResolutionState(stateWithUnits, {
      ...(reversingPlayer === 'white'
        ? { whiteAttackApplyState: attackApply }
        : { blackAttackApplyState: attackApply }),
    });
    return updatePhaseState(
      stateWithUnits,
      createResolveMeleePhaseState(stateWithUnits, {
        currentMeleeResolutionState: melee,
      }),
    );
  }

  it('given update reverse state in ranged attack resolution', () => {
    const state = createStateWithRangedAttackReverse();
    const unit = createTestUnit('white', { attack: 2 });
    const placement: UnitWithPlacement<StandardBoard> = {
      unit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const newReverse = createReverseState(placement, {
      finalPosition: { coordinate: 'E-5', facing: 'south' },
      completed: true,
    });

    const newState = updateReverseState(state, newReverse);

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
      phase.currentCommandResolutionState.attackApplyState?.reverseState
        ?.completed,
    ).toBe(true);
  });

  it('given update reverse state in melee resolution for white', () => {
    const state = createStateWithMeleeReverse('white');
    const unit = createTestUnit('white', { attack: 2 });
    const placement: UnitWithPlacement<StandardBoard> = {
      unit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const newReverse = createReverseState(placement, { completed: true });

    const newState = updateReverseState(state, newReverse);

    const phase = newState.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe('resolveMelee');
    if (phase?.phase !== 'resolveMelee') throw new Error('phase');
    expect(
      phase.currentMeleeResolutionState?.whiteAttackApplyState?.reverseState
        ?.completed,
    ).toBe(true);
  });

  it('given update reverse state in melee resolution for black', () => {
    const state = createStateWithMeleeReverse('black');
    const unit = createTestUnit('black', { attack: 2 });
    const placement: UnitWithPlacement<StandardBoard> = {
      unit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const newReverse = createReverseState(placement, { completed: true });

    const newState = updateReverseState(state, newReverse);

    const phase = newState.currentRoundState.currentPhaseState;
    expect(phase?.phase).toBe('resolveMelee');
    if (phase?.phase !== 'resolveMelee') throw new Error('phase');
    expect(
      phase.currentMeleeResolutionState?.blackAttackApplyState?.reverseState
        ?.completed,
    ).toBe(true);
  });

  it('given when ranged attack apply has no reverse state, throws', () => {
    const state = createEmptyGameState();
    const unit = createTestUnit('white', { attack: 2 });
    const placement: UnitWithPlacement<StandardBoard> = {
      unit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const attackApply = createAttackApplyState(unit);
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createRangedAttackResolutionState(state, {
        attackApplyState: attackApply,
      }),
    });
    const stateInPhase = updatePhaseState(state, phaseState);

    expect(() =>
      updateReverseState(stateInPhase, createReverseState(placement)),
    ).toThrow('No reverse state found in attack apply state');
  });

  it('given when in issueCommands but command type is not rangedAttack (movement), throws', () => {
    const state = createEmptyGameState();
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createMovementResolutionState(state),
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const unit = createTestUnit('white', { attack: 2 });
    const placement: UnitWithPlacement<StandardBoard> = {
      unit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };

    expect(() =>
      updateReverseState(stateInPhase, createReverseState(placement)),
    ).toThrow(
      'Reverse state update not expected in issueCommands (command type: movement)',
    );
  });

  it('given when in issueCommands with no command resolution state, throws', () => {
    const state = createEmptyGameState();
    const phaseState = createIssueCommandsPhaseState(state);
    const stateInPhase = updatePhaseState(state, phaseState);
    const unit = createTestUnit('white', { attack: 2 });
    const placement: UnitWithPlacement<StandardBoard> = {
      unit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };

    expect(() =>
      updateReverseState(stateInPhase, createReverseState(placement)),
    ).toThrow(
      'Reverse state update not expected in issueCommands (command type: none)',
    );
  });

  it('given when melee white attack apply has no reverse state, throws', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whitePlacement: UnitWithPlacement<StandardBoard> = {
      unit: whiteUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const blackPlacement: UnitWithPlacement<StandardBoard> = {
      unit: blackUnit,
      placement: { coordinate: 'E-5', facing: 'south' },
    };
    const melee = createMeleeResolutionState(state, {
      whiteAttackApplyState: createAttackApplyState(whiteUnit),
      blackAttackApplyState: createAttackApplyStateWithReverse(blackPlacement),
    });
    const stateInPhase = updatePhaseState(
      state,
      createResolveMeleePhaseState(state, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(() =>
      updateReverseState(stateInPhase, createReverseState(whitePlacement)),
    ).toThrow('No reverse state found in attack apply state');
  });

  it('given when melee black attack apply has no reverse state, throws', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whitePlacement: UnitWithPlacement<StandardBoard> = {
      unit: whiteUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const blackPlacement: UnitWithPlacement<StandardBoard> = {
      unit: blackUnit,
      placement: { coordinate: 'E-5', facing: 'south' },
    };
    const melee = createMeleeResolutionState(state, {
      whiteAttackApplyState: createAttackApplyStateWithReverse(whitePlacement),
      blackAttackApplyState: createAttackApplyState(blackUnit),
    });
    const stateInPhase = updatePhaseState(
      state,
      createResolveMeleePhaseState(state, {
        currentMeleeResolutionState: melee,
      }),
    );

    expect(() =>
      updateReverseState(stateInPhase, createReverseState(blackPlacement)),
    ).toThrow('No reverse state found in attack apply state');
  });

  it('given when not in issueCommands or resolveMelee phase, throws', () => {
    const state = createEmptyGameState();
    const stateInPlayCards = updatePhaseState(
      state,
      createPlayCardsPhaseState(),
    );
    const unit = createTestUnit('white', { attack: 2 });
    const placement: UnitWithPlacement<StandardBoard> = {
      unit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };

    expect(() =>
      updateReverseState(stateInPlayCards, createReverseState(placement)),
    ).toThrow('Reverse state update not expected in phase: playCards');
  });
});
