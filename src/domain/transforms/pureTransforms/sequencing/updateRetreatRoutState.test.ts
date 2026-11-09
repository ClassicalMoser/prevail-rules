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
    const retreatState = createRetreatState(placement, {
      legalRetreatPaths: [],
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

  it('a rout that completes closes the retreat holding it', () => {
    // §9.1.6: the unit has left, so the retreat has nothing left to do. A
    // rout with nothing to pay completes in the same write as it is resolved
    // (§9.3), which is the case that used to leave the retreat open.
    const state = createStateWithRangedAttackRetreat();
    const unit = createTestUnit('white', { attack: 2 });
    // A rout settled outright: no cards owed, so none are chosen.
    const settled = createRoutState('white', unit, {
      cardsChosen: true,
      completed: true,
      numberToDiscard: 0,
    });

    const newState = updateRetreatRoutState(state, settled);

    // Read the retreat back out of the ranged attack's apply: it, and not
    // only the rout inside it, is now complete.
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
    expect(retreat.completed).toBe(true);
  });
});
