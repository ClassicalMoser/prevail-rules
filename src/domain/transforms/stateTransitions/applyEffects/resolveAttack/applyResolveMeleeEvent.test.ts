import type { AttackResult } from '@entities';
import type { ResolveMeleeEvent } from '@events';
import type { GameState } from '@game';
import { createEmptyGameState } from '@factories';
import { getMeleeResolutionState } from '@queries';
import {
  createBoardWithEngagedUnits,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestCard,
  createTestUnit,
  updateCardState,
} from '@testing';
import {
  updateBoardState,
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
    // White's unit and Black's stand engaged on E-5, the melee's space.
    const engaged = updateBoardState(
      withCards,
      createBoardWithEngagedUnits(
        createTestUnit('white', { attack: 2 }),
        createTestUnit('black', { attack: 2 }),
        'E-5',
        'north',
      ),
    );
    const melee = createMeleeResolutionState(engaged);
    return updatePhaseState(
      engaged,
      createResolveMeleePhaseState(engaged, {
        currentMeleeResolutionState: melee,
      }),
    );
  }

  /** What a blow reached when it reached nothing. */
  const nothingReached: AttackResult = {
    unitRetreated: false,
    unitReversed: false,
    unitRouted: false,
  };

  /** A resolveMelee event with these results for White's unit; Black's reached nothing. */
  function meleeEvent(white: Partial<AttackResult> = {}): ResolveMeleeEvent {
    return {
      blackAttackResult: nothingReached,
      effectType: 'resolveMelee',
      eventType: 'gameEffect',
      whiteAttackResult: { ...nothingReached, ...white },
    };
  }

  it('bypasses every outcome on both sides when neither unit is hit', () => {
    const full = baseMeleeGameState();
    const event = meleeEvent();

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
    const event: ResolveMeleeEvent = meleeEvent({ unitReversed: true });

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
    const event: ResolveMeleeEvent = meleeEvent({ unitRouted: true });

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
    // White's unit was hit only to rout, so its rout is the one result due.
    expect(whiteApply.routState).toBe('pending');
    expect(whiteApply.retreatState).toBe('bypassed');
    expect(whiteApply.reverseState).toBe('bypassed');
    expect(blackApply.routState).toBe('bypassed');
    expect(blackApply.retreatState).toBe('bypassed');
    expect(blackApply.reverseState).toBe('bypassed');
  });

  it('leaves a pending retreat when white retreated', () => {
    const full = baseMeleeGameState();
    const event: ResolveMeleeEvent = meleeEvent({ unitRetreated: true });

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
