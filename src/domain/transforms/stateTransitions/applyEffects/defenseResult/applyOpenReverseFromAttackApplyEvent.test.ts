import { throwIfBypassed } from '@utils';
import type { OpenReverseFromAttackApplyEvent } from '@events';
import type { GameState } from '@game';
import { createAttackApplyState, createEmptyGameState } from '@factories';
import {
  getRangedAttackApplyState,
  getReverseStateFromAttackApply,
} from '@queries';
import {
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms/pureTransforms';

import { applyOpenReverseFromAttackApplyEvent } from './applyOpenReverseFromAttackApplyEvent';

/**
 * Opens the reverse under an attack apply whose reverse slot is still pending.
 * The unit is held by identity.
 */
describe('applyOpenReverseFromAttackApplyEvent function', () => {
  function stateWithPendingReverse(): {
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
      unitRetreated: false,
      unitReversed: true,
      unitRouted: false,
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

  it('opens a reverse holding the defending unit by identity', () => {
    const { state, defendingUnit } = stateWithPendingReverse();
    const event: OpenReverseFromAttackApplyEvent = {
      attackResolutionContext: 'rangedAttack',
      effectType: 'openReverseFromAttackApply',
      eventNumber: 0,
      eventType: 'gameEffect',
    };

    const next = applyOpenReverseFromAttackApplyEvent(event, state);
    const apply = getRangedAttackApplyState(next);
    const reverse = throwIfBypassed(
      getReverseStateFromAttackApply(apply),
      'the attack applies a reverse',
    );
    expect(reverse.substepType).toBe('reverse');
    expect(reverse.reversingUnit).toBe(defendingUnit);
  });
});
