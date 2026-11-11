import type { AttackResult, UnitInstance } from '@entities';
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
  } {
    const base = createEmptyGameState('standard');
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inPlay: createTestCard() },
      white: { ...base.cardState.white, inPlay: createTestCard() },
    });
    const defender = createTestUnit('white', { attack: 2 });
    const ranged = createRangedAttackResolutionState(withCards, {
      defendingUnit: defender,
    });
    const full = updatePhaseState(
      withCards,
      createIssueCommandsPhaseState(withCards, {
        currentCommandResolutionState: ranged,
      }),
    );
    return { defender, full };
  }

  /** A resolveRangedAttack event reaching the given thresholds, and no others. */
  function rangedEvent(
    reached: Partial<AttackResult> = {},
  ): ResolveRangedAttackEvent {
    return {
      attackResult: {
        unitRetreated: false,
        unitReversed: false,
        unitRouted: false,
        ...reached,
      },
      effectType: 'resolveRangedAttack',
      eventType: 'gameEffect',
    };
  }

  it('bypasses every outcome when the attack reaches no threshold', () => {
    const { full } = createRangedResolutionFixture();
    const event = rangedEvent();

    const next = applyResolveRangedAttackEvent(event, full);
    const ra = getRangedAttackResolutionState(next);
    const apply = throwIfPending(ra.attackApplyState, 'attack apply');
    expect(apply.routState).toBe('bypassed');
    expect(apply.retreatState).toBe('bypassed');
    expect(apply.reverseState).toBe('bypassed');
    expect(apply.completed).toBe(false);
  });

  it('leaves a pending reverse when the attack reversed the defender', () => {
    const { full } = createRangedResolutionFixture();
    const event = rangedEvent({
      unitReversed: true,
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
    const { full, defender } = createRangedResolutionFixture();
    const event = rangedEvent({
      unitRouted: true,
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
    const { full } = createRangedResolutionFixture();
    const event = rangedEvent({
      unitRetreated: true,
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
