import type { StandardBoard, UnitWithPlacement } from '@entities';
import { PLAY_CARDS_PHASE } from '@game';

import {
  createAttackApplyStateWithRout,
  createCleanupPhaseState,
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createRearEngagementState,
  createResolveMeleePhaseState,
  createRoutState,
  createTestCard,
  createTestUnit,
} from '@testing';
import { addUnitToBoard, updatePhaseState } from '@transforms';
import { describe, expect, it } from 'vitest';

import { generateResolveRoutEvent } from './generateResolveRoutEvent';

/**
 * `resolveRout` materializes rout discards: penalty and affected units come from whichever
 * rout substep is active—ranged attack-apply, melee (initiative player’s apply first),
 * rear engagement during movement, or cleanup rally after failed support.
 */
describe('generateResolveRoutEvent', () => {
  it('given ranged resolution with rout substep on white defender, source rangedAttack and that unit', () => {
    const state = createEmptyGameState();
    const defendingUnit = createTestUnit('white', { attack: 2 });
    const unitWithPlacement: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      unit: defendingUnit,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
    };
    const withBoard = {
      ...state,
      boardState: addUnitToBoard(state.boardState, unitWithPlacement),
    };
    const attackApply = createAttackApplyStateWithRout(defendingUnit);
    const ranged = createRangedAttackResolutionState(withBoard, {
      defendingUnit,
      attackApplyState: attackApply,
    });
    const phase = createIssueCommandsPhaseState(withBoard, {
      currentCommandResolutionState: ranged,
    });
    const full = updatePhaseState(withBoard, phase);

    const event = generateResolveRoutEvent(full, 0);
    expect(event.effectType).toBe('resolveRout');
    expect(event.routResolutionSource).toBe('rangedAttack');
    expect(event.penalty).toBe(defendingUnit.unitType.routPenalty);
    expect(event.unitInstances.has(defendingUnit)).toBe(true);
  });

  it('given black initiative and rout on both melee applies, uses black unit and melee source', () => {
    const state = createEmptyGameState({ currentInitiative: 'black' });
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whiteWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      unit: whiteUnit,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'north',
      },
    };
    const blackWp: UnitWithPlacement<StandardBoard> = {
      boardType: 'standard' as const,
      unit: blackUnit,
      placement: {
        boardType: 'standard' as const,
        coordinate: 'E-5',
        facing: 'south',
      },
    };
    let s = { ...state, boardState: addUnitToBoard(state.boardState, whiteWp) };
    s = { ...s, boardState: addUnitToBoard(s.boardState, blackWp) };

    const blackApply = createAttackApplyStateWithRout(blackUnit);
    const whiteApply = createAttackApplyStateWithRout(whiteUnit);

    const melee = createMeleeResolutionState(s, {
      whiteAttackApplyState: whiteApply,
      blackAttackApplyState: blackApply,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    const full = updatePhaseState(s, phase);

    const event = generateResolveRoutEvent(full, 0);
    expect(event.routResolutionSource).toBe('melee');
    expect(event.unitInstances.has(blackUnit)).toBe(true);
    expect(event.penalty).toBe(blackUnit.unitType.routPenalty);
  });

  it('given playCards phase, throws rout resolution phase guard', () => {
    const base = createEmptyGameState();
    const full = updatePhaseState(base, {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateResolveRoutEvent(full, 0)).toThrow(
      'Rout resolution not expected in phase: playCards',
    );
  });

  it('given issueCommands movement with rear engagement routState, source rearEngagementMovement', () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const whiteUnit = createTestUnit('white');
    const routState = createRoutState('white', whiteUnit, {
      numberToDiscard: 2,
    });
    const movement = createMovementResolutionState(state, {
      engagementState: createRearEngagementState({ routState }),
    });
    const full = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        currentCommandResolutionState: movement,
      }),
    );

    const event = generateResolveRoutEvent(full, 0);
    expect(event.routResolutionSource).toBe('rearEngagementMovement');
    expect(event.unitInstances.has(whiteUnit)).toBe(true);
  });

  it('given cleanup firstPlayerResolveRally with nested routState, source rally and listed unit', () => {
    const unit = createTestUnit('white', { attack: 2 });
    const base = createEmptyGameState();
    const full = updatePhaseState(
      base,
      createCleanupPhaseState({
        step: 'firstPlayerResolveRally',
        firstPlayerRallyResolutionState: {
          playerRallied: true,
          rallyResolved: true,
          unitsLostSupport: new Set(),
          routState: {
            substepType: 'rout',
            player: 'white',
            unitsToRout: new Set([unit]),
            numberToDiscard: undefined,
            cardsChosen: false,
            completed: false,
          },
          completed: false,
        },
      }),
    );

    const event = generateResolveRoutEvent(full, 0);
    expect(event.routResolutionSource).toBe('rally');
    expect(event.unitInstances.has(unit)).toBe(true);
  });

  it('given issueCommands with invalid melee-shaped CRS, throws movement/ranged expectation', () => {
    const state = createEmptyGameState();
    state.cardState.black.inPlay = createTestCard();
    const full = updatePhaseState(
      state,
      createIssueCommandsPhaseState(state, {
        // Intentionally invalid CRS shape to cover the defensive branch in generateResolveRoutEvent.
        currentCommandResolutionState: {
          commandResolutionType: 'melee',
        } as never,
      }),
    );

    expect(() => generateResolveRoutEvent(full, 0)).toThrow(
      'Current command resolution is not movement or ranged attack',
    );
  });
});
