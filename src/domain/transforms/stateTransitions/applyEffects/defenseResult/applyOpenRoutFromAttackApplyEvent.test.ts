import { throwIfBypassed } from '@utils';
import type { OpenRoutFromAttackApplyEvent } from '@events';
import type { GameState } from '@game';
import { createAttackApplyState, createEmptyGameState } from '@factories';
import {
  getRangedAttackApplyState,
  getRoutStateFromAttackApply,
} from '@queries';
import {
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createRetreatState,
  createReverseState,
  createTestUnit,
  legalRetreatsOf,
  placed,
} from '@testing';
import {
  addUnitToBoard,
  updateAttackApplyState,
  updatePhaseState,
} from '@transforms/pureTransforms';

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
      effectType: 'openRoutFromAttackApply',
      eventType: 'gameEffect',
    };

    const next = applyOpenRoutFromAttackApplyEvent(event, state);
    const apply = getRangedAttackApplyState(next);
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

  it('leaves the retreat and reverse already carried out as they were', () => {
    const { state, defendingUnit } = stateWithPendingRout();
    // The rout comes last (§7.5.2): by its turn the unit has fallen back and
    // turned about, and those results stay recorded.
    const before = getRangedAttackApplyState(state);
    const standing = placed(defendingUnit, 'E-5', 'north');
    const retreated = createRetreatState(standing, legalRetreatsOf(standing), {
      chosenRetreatPath: ['step'],
      completed: true,
    });
    const reversed = createReverseState(defendingUnit, { completed: true });
    const ready = updateAttackApplyState(state, {
      ...before,
      retreatState: retreated,
      reverseState: reversed,
    });

    const next = applyOpenRoutFromAttackApplyEvent(
      { effectType: 'openRoutFromAttackApply', eventType: 'gameEffect' },
      ready,
    );

    const apply = getRangedAttackApplyState(next);
    expect(apply.retreatState).toStrictEqual(retreated);
    expect(apply.reverseState).toStrictEqual(reversed);
  });
});
