import type { StandardBoard, UnitWithPlacement } from '@entities';
import {
  createAttackApplyStateWithRetreat,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createRetreatState,
  createRoutState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';
import { updateRetreatRoutState } from './updateRetreatRoutState';

/**
 * updateRetreatRoutState: pure transform; implementation in updateRetreatRoutState.ts.
 */
describe('updateRetreatRoutState', () => {
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
    const retreatState = createRetreatState(placement, {
      legalRetreatOptions: new Set(),
      routState: createRoutState('white', unit),
    });
    const attackApply = createAttackApplyStateWithRetreat(placement, {
      retreatState,
    });
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

  it('should update rout state within retreat in ranged attack resolution', () => {
    const state = createStateWithRangedAttackRetreat();
    const unit = createTestUnit('white', { attack: 2 });
    const newRout = createRoutState('white', unit, { numberToDiscard: 2 });

    const newState = updateRetreatRoutState(state, newRout);

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
    const retreat =
      phase.currentCommandResolutionState.attackApplyState?.retreatState;
    expect(retreat?.routState?.numberToDiscard).toBe(2);
  });
});
