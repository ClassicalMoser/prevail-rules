import type { StandardBoard, UnitWithPlacement } from '@entities';
import { throwIfNone, throwIfPending } from '@utils';
import {
  createAttackApplyStateWithRetreat,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createRetreatState,
  createRoutState,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '../';

import { updateRetreatRoutState } from './updateRetreatRoutState';

/**
 * UpdateRetreatRoutState: Creates a new game state with the rout state updated within a retreat state.
 */
describe(updateRetreatRoutState, () => {
  function createStateWithRangedAttackRetreat() {
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
    const retreatState = createRetreatState(placement, {
      legalRetreatOptions: [],
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

  it('given update rout state within retreat in ranged attack resolution', () => {
    const state = createStateWithRangedAttackRetreat();
    const unit = createTestUnit('white', { attack: 2 });
    const newRout = createRoutState('white', unit, { numberToDiscard: 2 });

    const newState = updateRetreatRoutState(state, newRout);

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
    const retreat = throwIfPending(attackApply.retreatState, 'retreat');
    expect(throwIfPending(retreat.routState, 'rout').numberToDiscard).toBe(2);
  });
});
