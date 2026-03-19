import type { StandardBoard, UnitWithPlacement } from '@entities';
import type { ChooseRetreatOptionEvent } from '@events';
import {
  getRetreatStateFromMelee,
  getRetreatStateFromRangedAttack,
} from '@queries';
import {
  createAttackApplyStateWithRetreat,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { applyChooseRetreatOptionEvent } from './applyChooseRetreatOptionEvent';

describe('applyChooseRetreatOptionEvent', () => {
  const chosenPosition = {
    coordinate: 'E-4' as const,
    facing: 'north' as const,
  };

  function createStateWithRangedAttackRetreat() {
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
    const attackApply = createAttackApplyStateWithRetreat(placement);
    const phaseState = createIssueCommandsPhaseState(stateWithUnit, {
      currentCommandResolutionState: createRangedAttackResolutionState(
        stateWithUnit,
        { attackApplyState: attackApply },
      ),
    });
    return updatePhaseState(stateWithUnit, phaseState);
  }

  it('updates finalPosition in ranged attack resolution', () => {
    const state = createStateWithRangedAttackRetreat();
    const event: ChooseRetreatOptionEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseRetreatOption',
      player: 'white',
      retreatOption: chosenPosition,
    };

    const newState = applyChooseRetreatOptionEvent(event, state);
    const retreatState = getRetreatStateFromRangedAttack(newState);

    expect(retreatState.finalPosition).toEqual(chosenPosition);
  });

  function createStateWithMeleeRetreat(retreatingPlayer: 'white' | 'black') {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const retreatingUnit = createTestUnit(retreatingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(
      retreatingPlayer === 'white' ? 'black' : 'white',
      { attack: 2 },
    );
    const retreatingPlacement: UnitWithPlacement<StandardBoard> = {
      unit: retreatingUnit,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const otherPlacement: UnitWithPlacement<StandardBoard> = {
      unit: otherUnit,
      placement: { coordinate: 'E-5', facing: 'south' },
    };
    let stateWithUnits = {
      ...state,
      boardState: addUnitToBoard(state.boardState, retreatingPlacement),
    };
    stateWithUnits = {
      ...stateWithUnits,
      boardState: addUnitToBoard(stateWithUnits.boardState, otherPlacement),
    };
    const attackApply = createAttackApplyStateWithRetreat(retreatingPlacement);
    const melee = createMeleeResolutionState(stateWithUnits, {
      ...(retreatingPlayer === 'white'
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

  it('updates finalPosition in melee resolution for white', () => {
    const state = createStateWithMeleeRetreat('white');
    const event: ChooseRetreatOptionEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseRetreatOption',
      player: 'white',
      retreatOption: chosenPosition,
    };

    const newState = applyChooseRetreatOptionEvent(event, state);
    const retreatState = getRetreatStateFromMelee(newState, 'white');

    expect(retreatState.finalPosition).toEqual(chosenPosition);
  });

  it('updates finalPosition in melee resolution for black', () => {
    const state = createStateWithMeleeRetreat('black');
    const event: ChooseRetreatOptionEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseRetreatOption',
      player: 'black',
      retreatOption: chosenPosition,
    };

    const newState = applyChooseRetreatOptionEvent(event, state);
    const retreatState = getRetreatStateFromMelee(newState, 'black');

    expect(retreatState.finalPosition).toEqual(chosenPosition);
  });

  it('throws when no retreat state for player', () => {
    const state = createEmptyGameState();
    const stateInIssueCommands = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state),
      }),
    );
    const event: ChooseRetreatOptionEvent<StandardBoard> = {
      eventType: 'playerChoice',
      choiceType: 'chooseRetreatOption',
      player: 'white',
      retreatOption: chosenPosition,
    };

    expect(() =>
      applyChooseRetreatOptionEvent(event, stateInIssueCommands),
    ).toThrow('No retreat state found for player white');
  });
});
