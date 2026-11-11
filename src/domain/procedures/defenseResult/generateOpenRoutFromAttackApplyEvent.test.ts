import type { GameState } from '@game';
import { PLAY_CARDS_PHASE } from '@game';
import { createAttackApplyState, createEmptyGameState } from '@factories';
import {
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createTestUnit,
  placed,
} from '@testing';
import {
  addUnitToBoard,
  updateCurrentInitiative,
  updatePhaseState,
} from '@transforms';

import { generateOpenRoutFromAttackApplyEvent } from './generateOpenRoutFromAttackApplyEvent';

/**
 * An attack that routed leaves the rout slot pending until this opener runs.
 * Context is ranged vs melee; in melee the defending player is named.
 */
describe('generateOpenRoutFromAttackApplyEvent function', () => {
  function stateWithRangedPendingRout(): GameState {
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
    return updatePhaseState(withBoard, phase);
  }

  function stateWithMeleePendingRout(
    defendingPlayer: 'white' | 'black',
  ): GameState {
    // The other side holds initiative, so the defender is the second player,
    // whose unit suffers first (§7.5.6).
    const state = updateCurrentInitiative(
      createEmptyGameState('standard'),
      defendingPlayer === 'white' ? 'black' : 'white',
    );
    const defendingUnit = createTestUnit(defendingPlayer, { attack: 2 });
    const otherUnit = createTestUnit(
      defendingPlayer === 'white' ? 'black' : 'white',
      { attack: 2 },
    );
    const defendingWp = placed(defendingUnit, 'E-5', 'north');
    const otherWp = placed(otherUnit, 'E-5', 'south');
    let s = {
      ...state,
      boardState: addUnitToBoard(state.boardState, defendingWp),
    };
    s = { ...s, boardState: addUnitToBoard(s.boardState, otherWp) };
    const attackApply = createAttackApplyState(defendingUnit, {
      unitRetreated: true,
      unitReversed: true,
      unitRouted: true,
    });
    // The defender's apply is the second player's, and it resolves first.
    const melee = createMeleeResolutionState(s, {
      secondPlayerAttackApplyState: attackApply,
    });
    const phase = createResolveMeleePhaseState(s, {
      currentMeleeResolutionState: melee,
    });
    return updatePhaseState(s, phase);
  }

  it('a ranged apply with a pending rout names the ranged context', () => {
    const event = generateOpenRoutFromAttackApplyEvent(
      stateWithRangedPendingRout(),
    );
    expect(event.effectType).toBe('openRoutFromAttackApply');
    expect(event.attackResolutionContext).toBe('rangedAttack');
    expect(event).not.toHaveProperty('defendingPlayer');
  });

  it('a melee apply with a pending rout names that defending player', () => {
    const event = generateOpenRoutFromAttackApplyEvent(
      stateWithMeleePendingRout('black'),
    );
    expect(event.effectType).toBe('openRoutFromAttackApply');
    expect(event.attackResolutionContext).toBe('melee');
    if (event.attackResolutionContext === 'melee') {
      expect(event.defendingPlayer).toBe('black');
    }
  });

  it('throws when the phase is not holding an attack apply', () => {
    const full = updatePhaseState(createEmptyGameState('standard'), {
      phase: PLAY_CARDS_PHASE,
      step: 'complete',
    });
    expect(() => generateOpenRoutFromAttackApplyEvent(full)).toThrow(
      'Attack-apply rout open not expected in phase: playCards',
    );
  });
});
