import type { GameState } from '@game';
import { createAttackApplyState, createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import { generateOpenReverseFromAttackApplyEvent } from './generateOpenReverseFromAttackApplyEvent';

/**
 * An attack that reversed leaves the reverse slot pending until this opener runs.
 */
describe('generateOpenReverseFromAttackApplyEvent function', () => {
  function stateWithRangedPendingReverse(): GameState {
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
    return updatePhaseState(withBoard, phase);
  }

  it('a ranged apply with a pending reverse names the ranged context', () => {
    const event = generateOpenReverseFromAttackApplyEvent(
      stateWithRangedPendingReverse(),
    );
    expect(event.effectType).toBe('openReverseFromAttackApply');
  });
});
