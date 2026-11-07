import type { GameState } from '@game';
import { createAttackApplyState, createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestUnit,
  placed,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';

import { generateOpenRetreatFromAttackApplyEvent } from './generateOpenRetreatFromAttackApplyEvent';

/**
 * An attack that retreated leaves the retreat slot pending until this opener runs.
 */
describe('generateOpenRetreatFromAttackApplyEvent function', () => {
  function stateWithRangedPendingRetreat(): GameState {
    const state = createEmptyGameState('standard');
    const defendingUnit = createTestUnit('white', { attack: 2 });
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

  it('a ranged apply with a pending retreat names the ranged context', () => {
    const event = generateOpenRetreatFromAttackApplyEvent(
      stateWithRangedPendingRetreat(),
      0,
    );
    expect(event.effectType).toBe('openRetreatFromAttackApply');
    expect(event.attackResolutionContext).toBe('rangedAttack');
  });
});
