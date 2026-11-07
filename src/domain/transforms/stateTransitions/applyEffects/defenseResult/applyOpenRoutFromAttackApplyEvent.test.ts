import { throwIfBypassed } from '@utils';
import type { OpenRoutFromAttackApplyEvent } from '@events';
import type { GameState } from '@game';
import { createAttackApplyState, createEmptyGameState } from '@factories';
import {
  getAttackApplyStateFromRangedAttack,
  getRoutStateFromAttackApply,
} from '@queries';
import {
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';

import { applyOpenRoutFromAttackApplyEvent } from './applyOpenRoutFromAttackApplyEvent';

/**
 * Opens the rout under an attack apply whose rout slot is still pending.
 */
describe('applyOpenRoutFromAttackApplyEvent function', () => {
  function stateWithPendingRout(): {
    state: GameState;
    defendingUnit: ReturnType<typeof createTestUnit>;
  } {
    const state = createEmptyGameState('standard');
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(defendingUnit, 'E-5', 'north');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const attackApply = createAttackApplyState(defendingUnit, {
      unitRetreated: true,
      unitReversed: true,
      unitRouted: true,
    });
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: attackApply,
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    return {
      defendingUnit,
      state: updatePhaseState(withBoard, phase),
    };
  }

  it('opens a rout listing the defending unit when the slot is pending', () => {
    const { state, defendingUnit } = stateWithPendingRout();
    const event: OpenRoutFromAttackApplyEvent = {
      attackResolutionContext: 'rangedAttack',
      effectType: 'openRoutFromAttackApply',
      eventNumber: 0,
      eventType: 'gameEffect',
    };

    const next = applyOpenRoutFromAttackApplyEvent(event, state);
    const apply = getAttackApplyStateFromRangedAttack(next);
    const rout = throwIfBypassed(
      getRoutStateFromAttackApply(apply),
      'the attack applies a rout',
    );
    expect(rout.substepType).toBe('rout');
    expect(rout.unitsToRout).toContain(defendingUnit);
    expect(rout.player).toBe('white');
    // The unit leaves when the rout opens, not when the discard is paid.
    expect(next.boardState.board['E-5']?.unitPresence.presenceType).toBe(
      'none',
    );
    expect(next.routedUnits).toContainEqual(defendingUnit);
  });

  it('bypasses retreat and reverse — a routed unit leaves, so those do not happen', () => {
    const { state } = stateWithPendingRout();
    const event: OpenRoutFromAttackApplyEvent = {
      attackResolutionContext: 'rangedAttack',
      effectType: 'openRoutFromAttackApply',
      eventNumber: 0,
      eventType: 'gameEffect',
    };

    const next = applyOpenRoutFromAttackApplyEvent(event, state);
    const apply = getAttackApplyStateFromRangedAttack(next);
    expect(apply.retreatState).toBe('bypassed');
    expect(apply.reverseState).toBe('bypassed');
  });
});
