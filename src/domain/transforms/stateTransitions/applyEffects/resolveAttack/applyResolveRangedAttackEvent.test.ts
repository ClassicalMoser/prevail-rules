import type { UnitInstance, UnitWithPlacement } from '@entities';
import type { ResolveRangedAttackEvent } from '@events';
import type { GameState } from '@game';
import { createEmptyGameState } from '@factories';
import { getRangedAttackResolutionState } from '@queries';
import {
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestCard,
  createTestUnit,
  updateCardState,
  placed,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { throwIfPending } from '@utils';

import { applyResolveRangedAttackEvent } from './applyResolveRangedAttackEvent';

/**
 * First strike resolution: builds an attack-apply shell from the procedure's
 * measured thresholds. Openers write the substeps later.
 */
describe('applyResolveRangedAttackEvent function', () => {
  /** IssueCommands + ranged CRS with white defender on E-5 and both inPlay cards. */
  function createRangedResolutionFixture(): {
    full: GameState;
    defender: UnitInstance;
    defenderWithPlacement: UnitWithPlacement;
  } {
    const base = createEmptyGameState('standard');
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inPlay: createTestCard() },
      white: { ...base.cardState.white, inPlay: createTestCard() },
    });
    const defender = createTestUnit('white', { attack: 2 });
    const defenderWithPlacement = placed(defender, 'E-5', 'north');
    const ranged = createRangedAttackResolutionState(withCards, {
      defendingUnit: defender,
    });
    const full = updatePhaseState(
      withCards,
      createIssueCommandsPhaseState(withCards, {
        currentCommandResolutionState: ranged,
      }),
    );
    return { defender, defenderWithPlacement, full };
  }

  /** Game effect merge: defaults plus patch. */
  function rangedEvent(
    defenderWithPlacement: UnitWithPlacement,
    patch: Partial<
      Omit<
        ResolveRangedAttackEvent,
        'defenderWithPlacement' | 'eventType' | 'effectType'
      >
    > = {},
  ): ResolveRangedAttackEvent {
    return {
      defenderWithPlacement,
      effectType: 'resolveRangedAttack',
      eventNumber: 0,
      eventType: 'gameEffect',
      retreated: false,
      reversed: false,
      routed: false,
      ...patch,
    };
  }

  it('bypasses every outcome when the attack reaches no threshold', () => {
    const { full, defenderWithPlacement } = createRangedResolutionFixture();
    const event = rangedEvent(defenderWithPlacement);

    const next = applyResolveRangedAttackEvent(event, full);
    const ra = getRangedAttackResolutionState(next);
    const apply = throwIfPending(ra.attackApplyState, 'attack apply');
    expect(apply.routState).toBe('bypassed');
    expect(apply.retreatState).toBe('bypassed');
    expect(apply.reverseState).toBe('bypassed');
    expect(apply.completed).toBe(false);
  });

  it('leaves a pending reverse when the attack reversed the defender', () => {
    const { full, defenderWithPlacement } = createRangedResolutionFixture();
    const event = rangedEvent(defenderWithPlacement, {
      reversed: true,
    });

    const next = applyResolveRangedAttackEvent(event, full);
    const ra = getRangedAttackResolutionState(next);
    const apply = throwIfPending(ra.attackApplyState, 'attack apply');
    expect(apply.attackResult.unitReversed).toBe(true);
    expect(apply.reverseState).toBe('pending');
    expect(apply.retreatState).toBe('bypassed');
    expect(apply.routState).toBe('bypassed');
  });

  it('leaves a pending rout when the attack routed the defender', () => {
    const { full, defender, defenderWithPlacement } =
      createRangedResolutionFixture();
    const event = rangedEvent(defenderWithPlacement, {
      routed: true,
    });

    const next = applyResolveRangedAttackEvent(event, full);
    const ra = getRangedAttackResolutionState(next);
    const apply = throwIfPending(ra.attackApplyState, 'attack apply');
    expect(apply.attackResult.unitRouted).toBe(true);
    expect(apply.routState).toBe('pending');
    expect(apply.defendingUnit).toBe(defender);
    // A rout supersedes retreat and reverse.
    expect(apply.retreatState).toBe('bypassed');
    expect(apply.reverseState).toBe('bypassed');
  });

  it('leaves a pending retreat when the attack retreated the defender', () => {
    const { full, defenderWithPlacement } = createRangedResolutionFixture();
    const event = rangedEvent(defenderWithPlacement, {
      retreated: true,
    });

    const next = applyResolveRangedAttackEvent(event, full);
    const ra = getRangedAttackResolutionState(next);
    const apply = throwIfPending(ra.attackApplyState, 'attack apply');
    // Legal options are not recorded here — the retreat opener computes them.
    expect(apply.retreatState).toBe('pending');
    expect(apply.routState).toBe('bypassed');
    expect(apply.reverseState).toBe('bypassed');
  });
});
