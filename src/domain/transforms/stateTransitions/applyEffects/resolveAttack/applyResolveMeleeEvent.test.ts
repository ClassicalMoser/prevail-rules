import type { UnitWithPlacement } from '@entities';
import type { ResolveMeleeEvent } from '@events';
import type { GameState } from '@game';
import { createEmptyGameState } from '@factories';
import { getMeleeResolutionState } from '@queries';
import {
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestCard,
  createTestUnit,
  updateCardState,
  placed,
} from '@testing';
import {
  updatePhaseState,
  updateCurrentInitiative,
} from '@transforms/pureTransforms';
import { throwIfPending } from '@utils';

import { applyResolveMeleeEvent } from './applyResolveMeleeEvent';

/**
 * Materializes procedure `resolveMelee` into per-side attack-apply shells.
 * The factory records which outcomes are due; openers write the substeps later.
 */
describe('applyResolveMeleeEvent function', () => {
  /** ResolveMelee phase with default melee CRS and both inPlay command cards set. */
  function baseMeleeGameState(): GameState {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inPlay: createTestCard() },
      white: { ...base.cardState.white, inPlay: createTestCard() },
    });
    const melee = createMeleeResolutionState(withCards);
    return updatePhaseState(
      withCards,
      createResolveMeleePhaseState(withCards, {
        currentMeleeResolutionState: melee,
      }),
    );
  }

  /** Mirror engaged pair on E-5 for event payloads. */
  function unitPlacements(): {
    whiteUnitWithPlacement: UnitWithPlacement;
    blackUnitWithPlacement: UnitWithPlacement;
  } {
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    return {
      blackUnitWithPlacement: placed(blackUnit, 'E-5', 'south'),
      whiteUnitWithPlacement: placed(whiteUnit, 'E-5', 'north'),
    };
  }

  /** Neutral resolveMelee event: no rout/retreat/reverse. */
  function baseMeleeEvent(
    placements: ReturnType<typeof unitPlacements>,
  ): ResolveMeleeEvent {
    return {
      blackUnitRetreated: false,
      blackUnitReversed: false,
      blackUnitRouted: false,
      blackUnitWithPlacement: placements.blackUnitWithPlacement,
      effectType: 'resolveMelee',
      eventType: 'gameEffect',
      location: 'E-5',
      whiteUnitRetreated: false,
      whiteUnitReversed: false,
      whiteUnitRouted: false,
      whiteUnitWithPlacement: placements.whiteUnitWithPlacement,
    };
  }

  it('bypasses every outcome on both sides when neither unit is hit', () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const event = baseMeleeEvent(placements);

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    const whiteApply = throwIfPending(
      melee.secondPlayerAttackApplyState,
      'apply',
    );
    const blackApply = throwIfPending(
      melee.firstPlayerAttackApplyState,
      'apply',
    );
    // A miss still needs completeAttackApply to close the shell.
    expect(whiteApply.completed).toBe(false);
    expect(whiteApply.routState).toBe('bypassed');
    expect(whiteApply.retreatState).toBe('bypassed');
    expect(whiteApply.reverseState).toBe('bypassed');
    expect(blackApply.completed).toBe(false);
    expect(blackApply.routState).toBe('bypassed');
    expect(blackApply.retreatState).toBe('bypassed');
    expect(blackApply.reverseState).toBe('bypassed');
  });

  it('leaves a pending reverse for white when only white reverses', () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const event: ResolveMeleeEvent = {
      ...baseMeleeEvent(placements),
      whiteUnitReversed: true,
    };

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    const whiteApply = throwIfPending(
      melee.secondPlayerAttackApplyState,
      'apply',
    );
    const blackApply = throwIfPending(
      melee.firstPlayerAttackApplyState,
      'apply',
    );
    expect(whiteApply.reverseState).toBe('pending');
    expect(whiteApply.retreatState).toBe('bypassed');
    expect(whiteApply.routState).toBe('bypassed');
    expect(blackApply.routState).toBe('bypassed');
    expect(blackApply.retreatState).toBe('bypassed');
    expect(blackApply.reverseState).toBe('bypassed');
  });

  it('leaves a pending rout for white when only white routes', () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const event: ResolveMeleeEvent = {
      ...baseMeleeEvent(placements),
      whiteUnitRouted: true,
    };

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    const whiteApply = throwIfPending(
      melee.secondPlayerAttackApplyState,
      'apply',
    );
    const blackApply = throwIfPending(
      melee.firstPlayerAttackApplyState,
      'apply',
    );
    // A rout supersedes retreat and reverse even if those thresholds also fell.
    expect(whiteApply.routState).toBe('pending');
    expect(whiteApply.retreatState).toBe('bypassed');
    expect(whiteApply.reverseState).toBe('bypassed');
    expect(blackApply.routState).toBe('bypassed');
    expect(blackApply.retreatState).toBe('bypassed');
    expect(blackApply.reverseState).toBe('bypassed');
  });

  it('leaves a pending retreat when white retreated', () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const event: ResolveMeleeEvent = {
      ...baseMeleeEvent(placements),
      whiteUnitRetreated: true,
    };

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    const whiteApply = throwIfPending(
      melee.secondPlayerAttackApplyState,
      'apply',
    );
    // Legal options are not recorded here — the retreat opener computes them.
    expect(whiteApply.retreatState).toBe('pending');
    expect(whiteApply.routState).toBe('bypassed');
    expect(whiteApply.reverseState).toBe('bypassed');
  });
});
