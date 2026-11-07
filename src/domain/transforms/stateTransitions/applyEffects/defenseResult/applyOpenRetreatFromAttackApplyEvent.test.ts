import { throwIfBypassed } from '@utils';
import type { OpenRetreatFromAttackApplyEvent } from '@events';
import type { GameState } from '@game';
import { createAttackApplyState, createEmptyGameState } from '@factories';
import {
  getRangedAttackApplyState,
  getRetreatStateFromAttackApply,
} from '@queries';
import {
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';

import { applyOpenRetreatFromAttackApplyEvent } from './applyOpenRetreatFromAttackApplyEvent';

/**
 * Opens the retreat under an attack apply whose retreat slot is still pending.
 * Legal options are computed from the board at open time.
 */
describe('applyOpenRetreatFromAttackApplyEvent function', () => {
  function stateWithPendingRetreat(): GameState {
    const state = createEmptyGameState('standard');
    // A stand-in defender on the board; getLegalRetreats reads this square.
    const defendingUnit = createTestUnit('white', { attack: 2, speed: 3 });
    const unitWithPlacement = placed(defendingUnit, 'E-5', 'north');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const attackApply = createAttackApplyState(defendingUnit, {
      unitRetreated: true,
      unitReversed: false,
      unitRouted: false,
    });
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: attackApply,
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return updatePhaseState(withBoard, phase);
  }

  it('opens a retreat for the defending unit when the slot is pending', () => {
    const state = stateWithPendingRetreat();
    const event: OpenRetreatFromAttackApplyEvent = {
      attackResolutionContext: 'rangedAttack',
      effectType: 'openRetreatFromAttackApply',
      eventNumber: 0,
      eventType: 'gameEffect',
    };

    const next = applyOpenRetreatFromAttackApplyEvent(event, state);
    const apply = getRangedAttackApplyState(next);
    const retreat = throwIfBypassed(
      getRetreatStateFromAttackApply(apply),
      'the attack applies a retreat',
    );
    expect(retreat.substepType).toBe('retreat');
    expect(retreat.retreatingUnit.unit.playerSide).toBe('white');
  });
});
