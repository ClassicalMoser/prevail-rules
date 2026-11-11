import {
  getIssueCommandsPhaseState,
  getRetreatStateFromAttackApply,
  isOpenSubstep,
} from '@queries';
import { throwIfBypassed, throwIfNone, throwIfPending } from '@utils';
import {
  createAttackApplyStateWithRetreat,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createRetreatState,
  createRoutState,
  createTestUnit,
  placed,
  enemyCuttingOffRetreat,
  legalRetreatsOf,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '../';

import { updateRetreatRoutState } from './updateRetreatRoutState';

import { createEmptyGameState } from '@factories';
/**
 * UpdateRetreatRoutState: Creates a new game state with the rout state updated within a retreat state.
 */
describe('updateRetreatRoutState function', () => {
  function createStateWithRangedAttackRetreat() {
    const state = createEmptyGameState('standard');
    const unit = createTestUnit('white', { attack: 2 });
    const placement = placed(unit, 'E-5', 'north');
    const stateWithUnit = {
      ...state,
      boardState: addUnitToBoard(state.boardState, placement),
    };
    const retreatState = createRetreatState(
      placement,
      legalRetreatsOf(placement, [enemyCuttingOffRetreat(placement)]),
      {
        routState: createRoutState('white', unit),
      },
    );
    const attackApply = createAttackApplyStateWithRetreat(
      placement,
      legalRetreatsOf(placement),
      {
        retreatState,
      },
    );
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
    const retreat = throwIfBypassed(
      getRetreatStateFromAttackApply(attackApply),
      'the attack applies a retreat',
    );
    const rout = retreat.routState;
    // The update wrote an open rout under the retreat; pending and bypassed are not readable.
    expect(isOpenSubstep(rout)).toBe(true);
    if (!isOpenSubstep(rout)) {
      throw new Error('expected open rout');
    }
    expect(rout.numberToDiscard).toBe(2);
  });

  it('writes a settled rout and leaves the retreat for settleRout to close', () => {
    // The writer records the rout only. Closing the retreat it settled
    // (§9.1.6) is settleRout's, so both ways of settling share it.
    const state = createStateWithRangedAttackRetreat();
    const unit = createTestUnit('white', { attack: 2 });
    // A rout settled outright: no cards owed, so none are chosen.
    const settled = createRoutState('white', unit, {
      cardsChosen: true,
      completed: true,
      numberToDiscard: 0,
    });

    const newState = updateRetreatRoutState(state, settled);

    // Read the retreat back out of the ranged attack's apply: the rout inside
    // it is settled, and the retreat itself is still open.
    const phase = getIssueCommandsPhaseState(newState);
    const command = throwIfPending(
      phase.currentCommandResolutionState,
      'command',
    );
    if (command.commandResolutionType !== 'rangedAttack') {
      throw new Error('type');
    }
    const apply = throwIfPending(command.attackApplyState, 'attack apply');
    const retreat = throwIfBypassed(
      getRetreatStateFromAttackApply(apply),
      'the attack applies a retreat',
    );
    const rout = throwIfBypassed(
      throwIfPending(retreat.routState, 'rout'),
      'the rout was opened',
    );
    expect(rout.completed).toBe(true);
    expect(retreat.completed).toBe(false);
  });
});
