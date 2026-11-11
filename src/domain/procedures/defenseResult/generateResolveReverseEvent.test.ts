import { PLAY_CARDS_PHASE } from '@game';

import {
  createAttackApplyStateWithReverse,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
  placed,
} from '@testing';
import {
  addUnitToBoard,
  updatePhaseState,
  updateCurrentInitiative,
} from '@transforms';

import { generateResolveReverseEvent } from './generateResolveReverseEvent';

import { createEmptyGameState } from '@factories';
/**
 * `resolveReverse` is the defender pivoting to strike back: context is ranged vs melee,
 * unit is the reversing defender’s board placement, and new placement is the factory default
 * from the reverse substep (facing flips for the shown geometries).
 */
describe('generateResolveReverseEvent function', () => {
  it('given ranged attack-apply in reverse substep, context rangedAttack and E-5 south facing', () => {
    const state = createEmptyGameState('standard');
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement = placed(defendingUnit, 'E-5', 'north');
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const attackApply = createAttackApplyStateWithReverse(
      unitWithPlacement.unit,
    );
    const ranged = createRangedAttackResolutionState(withBoard, {
      attackApplyState: attackApply,
      defendingUnit,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);

    const event = generateResolveReverseEvent(full);
    expect(event.effectType).toBe('resolveReverse');
    expect(event.unit).toStrictEqual(unitWithPlacement.unit);
    expect(event.facing).toBe('south');
  });

  it("turns the second player's unit first, and holds the facing of one still engaged", () => {
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'white',
    );
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp = placed(whiteUnit, 'E-5', 'east');
    const blackWp = placed(blackUnit, 'E-5', 'west');
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };

    const whiteApply = createAttackApplyStateWithReverse(whiteWp.unit);
    const blackApply = createAttackApplyStateWithReverse(blackWp.unit);

    const melee = createMeleeResolutionState(s, {
      secondPlayerAttackApplyState: blackApply,
      firstPlayerAttackApplyState: whiteApply,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    const full = updatePhaseState(s, phase);

    const event = generateResolveReverseEvent(full);
    expect(event.effectType).toBe('resolveReverse');
    // White holds initiative and strikes first, so black's unit is the second
    // player's and is the one that suffers first (§7.5.6).
    expect(event.unit).toBe(blackUnit);
    // Both units share E-5, so the black unit is engaged and holds the facing
    // it had (§7.5.5). The reverse still resolves; it just turns nobody.
    expect(event.facing).toBe('west');
  });

  it('given empty game with no phase slice, throws no current phase state', () => {
    const full = createEmptyGameState('standard');
    expect(() => generateResolveReverseEvent(full)).toThrow(
      'No current phase state found',
    );
  });

  it('given playCards phase, throws reverse resolution phase guard', () => {
    const full = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateResolveReverseEvent(full)).toThrow(
      'Reverse resolution not expected in phase: playCards',
    );
  });
});
