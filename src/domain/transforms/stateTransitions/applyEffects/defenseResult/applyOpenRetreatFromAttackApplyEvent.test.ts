import { throwIfBypassed } from '@utils';
import type { MoveDelta } from '@entities';
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
 * Opens the retreat under an attack apply whose retreat slot is still pending,
 * writing the retreats its procedure recorded on the event. The transform
 * does not judge them, so each case varies the event to show one branch.
 */
describe('applyOpenRetreatFromAttackApplyEvent function', () => {
  function stateWithPendingRetreat(): GameState {
    const state = createEmptyGameState('standard');
    // A stand-in defender on the board, the unit the retreat is opened for.
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

  /** The open event as its procedure would build it, carrying `retreatPaths`. */
  function openWith(
    retreatPaths: MoveDelta[][],
  ): OpenRetreatFromAttackApplyEvent {
    const event: OpenRetreatFromAttackApplyEvent = {
      attackResolutionContext: 'rangedAttack',
      effectType: 'openRetreatFromAttackApply',
      eventType: 'gameEffect',
      retreatPaths,
    };
    return event;
  }

  /** The retreat the apply now holds. */
  function openedRetreat(state: GameState) {
    const retreat = throwIfBypassed(
      getRetreatStateFromAttackApply(getRangedAttackApplyState(state)),
      'the attack applies a retreat',
    );
    return retreat;
  }

  it('a lone retreat is opened already chosen, with no rout to follow', () => {
    // On an empty board the unit's one retreat is a step straight back.
    const next = applyOpenRetreatFromAttackApplyEvent(
      openWith([['step']]),
      stateWithPendingRetreat(),
    );

    const retreat = openedRetreat(next);
    expect(retreat.retreatingUnit.unit.playerSide).toBe('white');
    expect(retreat.legalRetreatPaths).toStrictEqual([['step']]);
    // One legal retreat is no choice (§9.1.3), and one that can be made never
    // turns into a rout (§9.1.6).
    expect(retreat.chosenRetreatPath).toStrictEqual(['step']);
    expect(retreat.routState).toBe('bypassed');
  });

  it('a tie is opened for the owner to choose', () => {
    // Two equally small retreats, as the procedure finds them when an enemy
    // stands behind the unit; the transform writes them without judging.
    const next = applyOpenRetreatFromAttackApplyEvent(
      openWith([
        ['turnLeft', 'step'],
        ['turnRight', 'step'],
      ]),
      stateWithPendingRetreat(),
    );

    const retreat = openedRetreat(next);
    expect(retreat.legalRetreatPaths).toStrictEqual([
      ['turnLeft', 'step'],
      ['turnRight', 'step'],
    ]);
    expect(retreat.chosenRetreatPath).toBe('pending');
  });

  it('no retreat at all leaves the rout due', () => {
    // §9.1.6: a unit that must retreat and cannot routs instead.
    const next = applyOpenRetreatFromAttackApplyEvent(
      openWith([]),
      stateWithPendingRetreat(),
    );

    const retreat = openedRetreat(next);
    expect(retreat.legalRetreatPaths).toStrictEqual([]);
    expect(retreat.routState).toBe('pending');
  });
});
