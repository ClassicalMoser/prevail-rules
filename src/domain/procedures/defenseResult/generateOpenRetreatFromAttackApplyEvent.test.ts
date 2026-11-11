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
  /**
   * White's unit on E-5 facing north was hit by a ranged attack to retreat.
   * With `enemyBehind`, a black unit on F-5 faces it from behind.
   */
  function stateWithRangedPendingRetreat(enemyBehind = false): GameState {
    const state = createEmptyGameState('standard');
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(defendingUnit, 'E-5', 'north');
    const withDefender = addUnitToBoard(state.boardState, unitWithPlacement);
    const withBoard = {
      ...state,
      boardState: enemyBehind
        ? addUnitToBoard(
            withDefender,
            placed(createTestUnit('black'), 'F-5', 'south'),
          )
        : withDefender,
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
    );
    expect(event.effectType).toBe('openRetreatFromAttackApply');
    expect(event.attackResolutionContext).toBe('rangedAttack');
  });

  it('records the one retreat open to a unit with room behind it', () => {
    // §9.1.3: on an empty board the smallest retreat is one step straight
    // back, and it is worked out here so the log shows what was legal.
    const event = generateOpenRetreatFromAttackApplyEvent(
      stateWithRangedPendingRetreat(),
    );

    expect(event.retreatPaths).toStrictEqual([['step']]);
  });

  it('records both equally small retreats when the way straight back is held', () => {
    // An enemy on F-5 blocks the step straight back; turning 45° either way
    // and stepping back are the two smallest retreats left (§9.1.3, §9.1.4).
    const event = generateOpenRetreatFromAttackApplyEvent(
      stateWithRangedPendingRetreat(true),
    );

    expect(event.retreatPaths).toStrictEqual([
      ['turnLeft', 'step'],
      ['turnRight', 'step'],
    ]);
  });
});
