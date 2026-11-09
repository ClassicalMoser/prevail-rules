import type { MoveDelta } from '@entities';
import { PLAY_CARDS_PHASE } from '@game';

import {
  createAttackApplyStateWithRetreat,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
  placed,
} from '@testing';
import {
  addUnitToBoard,
  updatePhaseState,
  updateCurrentInitiative,
} from '@transforms';

import { generateResolveRetreatEvent } from './generateResolveRetreatEvent';

import { createEmptyGameState } from '@factories';
/**
 * `resolveRetreat` closes a legal retreat: starting placement is the defender on the board,
 * the way back is whatever path and ending the retreat substep recorded. Ranged stacks nest retreat under
 * one defender’s attack-apply; melee can hold two retreats and the procedure picks the
 * initiative player’s path first.
 */
describe('generateResolveRetreatEvent function', () => {
  // A unit on E-5 falls straight back one step, whichever way it faces: the
  // path names the move, and where it ends follows from the way the unit faces.
  const stepBack: MoveDelta[] = ['step'];

  it('given ranged attack-apply with retreat substep and a chosen retreat, event carries that path', () => {
    const state = createEmptyGameState('standard');
    const retreatingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(retreatingUnit, 'E-5', 'north');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const attackApply = createAttackApplyStateWithRetreat(unitWithPlacement, {
      retreatState: createRetreatState(unitWithPlacement, {
        chosenRetreatPath: stepBack,
      }),
    });
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: attackApply,
      defendingUnit: retreatingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);

    const event = generateResolveRetreatEvent(full, 0);
    expect(event.effectType).toBe('resolveRetreat');
    expect(event.startingPosition).toStrictEqual(unitWithPlacement);
    expect(event.path).toStrictEqual(['step']);
    expect(event.startingPosition.unit).toBe(retreatingUnit);
  });

  it("with both retreats ready, the second player's unit falls back first (§7.5.6)", () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp = placed(whiteUnit, 'E-5', 'north');
    const blackWp = placed(blackUnit, 'E-5', 'south');
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };

    const whiteRetreat = createRetreatState(whiteWp, {
      chosenRetreatPath: stepBack,
    });
    const blackRetreat = createRetreatState(blackWp, {
      chosenRetreatPath: stepBack,
    });

    const whiteApply = createAttackApplyStateWithRetreat(whiteWp, {
      retreatState: whiteRetreat,
    });
    const blackApply = createAttackApplyStateWithRetreat(blackWp, {
      retreatState: blackRetreat,
    });

    const melee = createMeleeResolutionState(s, {
      secondPlayerAttackApplyState: blackApply,
      firstPlayerAttackApplyState: whiteApply,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    const full = updatePhaseState(s, phase);

    // White holds initiative and strikes first, so black's unit, the second
    // player's, is the one that falls back first.
    const event = generateResolveRetreatEvent(full, 0);
    expect(event.startingPosition.unit).toBe(blackUnit);
    expect(event.path).toStrictEqual(['step']);
  });

  it('given playCards phase, throws retreat resolution phase guard', () => {
    const base = createEmptyGameState('standard');
    const full = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateResolveRetreatEvent(full, 0)).toThrow(
      'Retreat resolution not expected in phase: playCards',
    );
  });

  it('given ranged apply with retreat substep but no retreat chosen yet, throws', () => {
    const state = createEmptyGameState('standard');
    const retreatingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(retreatingUnit, 'E-5', 'north');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const attackApply = createAttackApplyStateWithRetreat(unitWithPlacement);
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: attackApply,
      defendingUnit: retreatingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);

    expect(() => generateResolveRetreatEvent(full, 0)).toThrow(
      'No retreat has been chosen yet',
    );
  });
});
