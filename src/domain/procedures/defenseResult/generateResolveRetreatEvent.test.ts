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
  legalRetreatsOf,
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
    // Open ground behind: the unit's only way back is the step already chosen.
    const openGround = legalRetreatsOf(unitWithPlacement);
    const attackApply = createAttackApplyStateWithRetreat(
      unitWithPlacement,
      openGround,
      {
        retreatState: createRetreatState(unitWithPlacement, openGround, {
          chosenRetreatPath: stepBack,
        }),
      },
    );
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: attackApply,
      defendingUnit: retreatingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);

    const event = generateResolveRetreatEvent(full);
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

    // Each engaged unit has open ground behind it, and has already chosen the
    // step back.
    const whitePaths = legalRetreatsOf(whiteWp, [blackWp]);
    const blackPaths = legalRetreatsOf(blackWp, [whiteWp]);
    const whiteRetreat = createRetreatState(whiteWp, whitePaths, {
      chosenRetreatPath: stepBack,
    });
    const blackRetreat = createRetreatState(blackWp, blackPaths, {
      chosenRetreatPath: stepBack,
    });

    const whiteApply = createAttackApplyStateWithRetreat(whiteWp, whitePaths, {
      retreatState: whiteRetreat,
    });
    const blackApply = createAttackApplyStateWithRetreat(blackWp, blackPaths, {
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
    const event = generateResolveRetreatEvent(full);
    expect(event.startingPosition.unit).toBe(blackUnit);
    expect(event.path).toStrictEqual(['step']);
  });

  it('throws outside any combat, where no retreat can be waiting to move', () => {
    // Playing cards resolves no attack, so nothing can be retreating.
    const base = createEmptyGameState('standard');
    const full = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateResolveRetreatEvent(full)).toThrow(
      'Retreat resolution not expected in phase: playCards',
    );
  });

  it('throws while the owner has still to choose the way back', () => {
    const state = createEmptyGameState('standard');
    const retreatingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(retreatingUnit, 'E-5', 'north');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    // Open ground behind, but the player has not picked the way back yet.
    const attackApply = createAttackApplyStateWithRetreat(
      unitWithPlacement,
      legalRetreatsOf(unitWithPlacement),
    );
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: attackApply,
      defendingUnit: retreatingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);

    expect(() => generateResolveRetreatEvent(full)).toThrow(
      'No retreat has been chosen yet',
    );
  });
});
