import { getReverseStateFromAttackApply } from '@queries';
import { throwIfNone, throwIfPending } from '@utils';
import {
  createAttackApplyState,
  createAttackApplyStateWithReverse,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createReverseState,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '../';

import { updateReverseState } from './updateReverseState';

import { createEmptyGameState } from '@factories';
/**
 * UpdateReverseState: Creates a new game state with the reverse state updated in an attack apply state.
 */
describe('updateReverseState function', () => {
  function createStateWithRangedAttackReverse() {
    const state = createEmptyGameState('standard');
    const unit = createTestUnit('white', { attack: 2 });
    const placement = placed(unit, 'E-5', 'north');
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
    const state = createEmptyGameState('standard');
    const reversingUnit = createTestUnit(reversingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(
      reversingPlayer === 'white' ? 'black' : 'white',
      {
        attack: 2,
      },
    );
    const reversingPlacement = placed(reversingUnit, 'E-5', 'north');
    const otherPlacement = placed(otherUnit, 'E-5', 'south');
    let stateWithUnits = {
      ...state,
      boardState: addUnitToBoard(state.boardState, reversingPlacement),
    };
    stateWithUnits = {
      ...stateWithUnits,
      boardState: addUnitToBoard(stateWithUnits.boardState, otherPlacement),
    };
    const attackApply = createAttackApplyStateWithReverse(reversingPlacement);
    const melee = createMeleeResolutionState(
      stateWithUnits,
      reversingPlayer === 'white'
        ? { whiteAttackApplyState: attackApply }
        : { blackAttackApplyState: attackApply },
    );
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
    const placement = placed(unit, 'E-5', 'north');
    const newReverse = createReverseState(placement, {
      completed: true,
      finalPosition: {
        coordinate: 'E-5',
        facing: 'south',
      },
    });

    const newState = updateReverseState(state, newReverse);

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
    if (commandState.commandResolutionType !== 'rangedAttack') {
      throw new Error('type');
    }
    const attackApply = throwIfPending(
      commandState.attackApplyState,
      'attack apply',
    );
    expect(getReverseStateFromAttackApply(attackApply).completed).toBe(true);
  });

  it('given update reverse state in melee resolution for white', () => {
    const state = createStateWithMeleeReverse('white');
    const unit = createTestUnit('white', { attack: 2 });
    const placement = placed(unit, 'E-5', 'north');
    const newReverse = createReverseState(placement, { completed: true });

    const newState = updateReverseState(state, newReverse);

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
    expect(getReverseStateFromAttackApply(whiteApply).completed).toBe(true);
  });

  it('given update reverse state in melee resolution for black', () => {
    const state = createStateWithMeleeReverse('black');
    const unit = createTestUnit('black', { attack: 2 });
    const placement = placed(unit, 'E-5', 'north');
    const newReverse = createReverseState(placement, { completed: true });

    const newState = updateReverseState(state, newReverse);

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
    expect(getReverseStateFromAttackApply(blackApply).completed).toBe(true);
  });

  it('given when ranged attack apply has no reverse state, throws', () => {
    const state = createEmptyGameState('standard');
    const unit = createTestUnit('white', { attack: 2 });
    const placement = placed(unit, 'E-5', 'north');
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
    const state = createEmptyGameState('standard');
    const phaseState = createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: createMovementResolutionState(state),
    });
    const stateInPhase = updatePhaseState(state, phaseState);
    const unit = createTestUnit('white', { attack: 2 });
    const placement = placed(unit, 'E-5', 'north');

    expect(() =>
      updateReverseState(stateInPhase, createReverseState(placement)),
    ).toThrow(
      'Reverse state update not expected in issueCommands (command type: movement)',
    );
  });

  it('given when in issueCommands with no command resolution state, throws', () => {
    const state = createEmptyGameState('standard');
    const phaseState = createIssueCommandsPhaseState(state);
    const stateInPhase = updatePhaseState(state, phaseState);
    const unit = createTestUnit('white', { attack: 2 });
    const placement = placed(unit, 'E-5', 'north');

    expect(() =>
      updateReverseState(stateInPhase, createReverseState(placement)),
    ).toThrow('No command resolution state found');
  });

  it('given when melee white attack apply has no reverse state, throws', () => {
    const state = createEmptyGameState('standard');
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whitePlacement = placed(whiteUnit, 'E-5', 'north');
    const blackPlacement = placed(blackUnit, 'E-5', 'south');
    const melee = createMeleeResolutionState(state, {
      blackAttackApplyState: createAttackApplyStateWithReverse(blackPlacement),
      whiteAttackApplyState: createAttackApplyState(whiteUnit),
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
    const state = createEmptyGameState('standard');
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whitePlacement = placed(whiteUnit, 'E-5', 'north');
    const blackPlacement = placed(blackUnit, 'E-5', 'south');
    const melee = createMeleeResolutionState(state, {
      blackAttackApplyState: createAttackApplyState(blackUnit),
      whiteAttackApplyState: createAttackApplyStateWithReverse(whitePlacement),
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
    const state = createEmptyGameState('standard');
    const stateInPlayCards = updatePhaseState(
      state,
      createPlayCardsPhaseState(),
    );
    const unit = createTestUnit('white', { attack: 2 });
    const placement = placed(unit, 'E-5', 'north');

    expect(() =>
      updateReverseState(stateInPlayCards, createReverseState(placement)),
    ).toThrow('Reverse state update not expected in phase: playCards');
  });
});
