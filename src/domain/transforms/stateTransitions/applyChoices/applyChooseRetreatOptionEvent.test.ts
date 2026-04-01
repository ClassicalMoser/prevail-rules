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

/**
 * After `resolveRetreat` lists legal cells, the defender picks one: this choice writes
 * `finalPosition` on the active retreat substep (ranged attack-apply or the correct melee side).
 */
describe('applyChooseRetreatOptionEvent', () => {
  const chosenPosition = {
    boardType: 'standard' as const,
    coordinate: 'E-4' as const,
    facing: 'north' as const,
  };

  /** issueCommands + ranged CRS + retreat substep on white at E-5 (no finalPosition yet). */
  function createStateWithRangedAttackRetreat() {
    const state = createEmptyGameState();
    const unit = createTestUnit('white', { attack: 2 });
    const placement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      unit,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
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

  it('given ranged retreat flow, white chooses E-4 north, retreat substep finalPosition matches', () => {
    const state = createStateWithRangedAttackRetreat();
    const event: ChooseRetreatOptionEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: 'playerChoice',
      choiceType: 'chooseRetreatOption',
      boardType: 'standard',
      player: 'white',
      retreatOption: chosenPosition,
    };

    const newState = applyChooseRetreatOptionEvent(event, state);
    const retreatState = getRetreatStateFromRangedAttack(newState);

    expect(retreatState.finalPosition).toEqual(chosenPosition);
  });

  /** resolveMelee + one-sided retreat apply: both players engaged on E-5 (north vs south). */
  function createStateWithMeleeRetreat(retreatingPlayer: 'white' | 'black') {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const retreatingUnit = createTestUnit(retreatingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(
      retreatingPlayer === 'white' ? 'black' : 'white',
      { attack: 2 },
    );
    const retreatingPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      unit: retreatingUnit,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
    };
    const otherPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      unit: otherUnit,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'south',
      },
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

  it('given white melee retreat apply, white chooses E-4 north, white retreat finalPosition matches', () => {
    const state = createStateWithMeleeRetreat('white');
    const event: ChooseRetreatOptionEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: 'playerChoice',
      choiceType: 'chooseRetreatOption',
      boardType: 'standard',
      player: 'white',
      retreatOption: chosenPosition,
    };

    const newState = applyChooseRetreatOptionEvent(event, state);
    const retreatState = getRetreatStateFromMelee(newState, 'white');

    expect(retreatState.finalPosition).toEqual(chosenPosition);
  });

  it('given black melee retreat apply, black chooses E-4 north, black retreat finalPosition matches', () => {
    const state = createStateWithMeleeRetreat('black');
    const event: ChooseRetreatOptionEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: 'playerChoice',
      choiceType: 'chooseRetreatOption',
      boardType: 'standard',
      player: 'black',
      retreatOption: chosenPosition,
    };

    const newState = applyChooseRetreatOptionEvent(event, state);
    const retreatState = getRetreatStateFromMelee(newState, 'black');

    expect(retreatState.finalPosition).toEqual(chosenPosition);
  });

  it('given movement CRS only, white chooseRetreat throws no retreat state for player', () => {
    const state = createEmptyGameState();
    const stateInIssueCommands = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: createMovementResolutionState(state),
      }),
    );
    const event: ChooseRetreatOptionEvent<StandardBoard> = {
      eventNumber: 0,
      eventType: 'playerChoice',
      choiceType: 'chooseRetreatOption',
      boardType: 'standard',
      player: 'white',
      retreatOption: chosenPosition,
    };

    expect(() =>
      applyChooseRetreatOptionEvent(event, stateInIssueCommands),
    ).toThrow('No retreat state found for player white');
  });
});
