import type { AttackResult, PlayerSide } from '@entities';
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
  replaceBoard,
  updateCardState,
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
  /** White's unit in the melee. */
  const whiteUnit = createTestUnit('white', { attack: 2 });

  /** Black's unit in the melee. */
  const blackUnit = createTestUnit('black', { attack: 3 });

  /**
   * ResolveMelee phase with default melee CRS and both inPlay command cards set.
   * Black holds the initiative unless the case says otherwise, so White's
   * unit is the second player's.
   */
  function baseMeleeGameState(initiative: PlayerSide = 'black'): GameState {
    const base = updateCurrentInitiative(
      createEmptyGameState('standard'),
      initiative,
    );
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inPlay: createTestCard() },
      white: { ...base.cardState.white, inPlay: createTestCard() },
    });
    // White's unit and Black's stand engaged on E-5, the melee's space.
    const engaged = replaceBoard(
      withCards,
      createBoardWithEngagedUnits(whiteUnit, blackUnit, 'E-5', 'north'),
    );
    const melee = createMeleeResolutionState(engaged);
    return updatePhaseState(
      engaged,
      createResolveMeleePhaseState(engaged, {
        currentMeleeResolutionState: melee,
      }),
    );
  }

  /** What an attack reached when it reached nothing. */
  const nothingReached: AttackResult = {
    unitRetreated: false,
    unitReversed: false,
    unitRouted: false,
  };

  /** A resolveMelee event with these results for White's unit; Black's reached nothing. */
  function meleeEvent(white: Partial<AttackResult> = {}): ResolveMeleeEvent {
    return {
      attackResultOnBlackUnit: nothingReached,
      attackResultOnWhiteUnit: { ...nothingReached, ...white },
      effectType: 'resolveMelee',
      eventType: 'gameEffect',
    };
  }

  it('bypasses every outcome on both sides when neither unit is hit', () => {
    const full = baseMeleeGameState();
    const event = meleeEvent();

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    const whiteApply = throwIfPending(
      melee.attackOnSecondPlayerApplyState,
      'apply',
    );
    const blackApply = throwIfPending(
      melee.attackOnFirstPlayerApplyState,
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
      melee.attackOnSecondPlayerApplyState,
      'apply',
    );
    const blackApply = throwIfPending(
      melee.attackOnFirstPlayerApplyState,
      'apply',
    );
    expect(whiteApply.reverseState).toBe('pending');
    expect(whiteApply.retreatState).toBe('bypassed');
    expect(whiteApply.routState).toBe('bypassed');
    expect(blackApply.routState).toBe('bypassed');
    expect(blackApply.retreatState).toBe('bypassed');
    expect(blackApply.reverseState).toBe('bypassed');
  });

  it('leaves a pending rout for white when only white routs', () => {
    const full = baseMeleeGameState();
    const event: ResolveMeleeEvent = meleeEvent({ unitRouted: true });

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    const whiteApply = throwIfPending(
      melee.attackOnSecondPlayerApplyState,
      'apply',
    );
    const blackApply = throwIfPending(
      melee.attackOnFirstPlayerApplyState,
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
      melee.attackOnSecondPlayerApplyState,
      'apply',
    );
    // Legal options are not recorded here — the retreat opener computes them.
    expect(whiteApply.retreatState).toBe('pending');
    expect(whiteApply.routState).toBe('bypassed');
    expect(whiteApply.reverseState).toBe('bypassed');
  });

  it('writes White’s result in the first player’s slot when White holds the initiative', () => {
    // The slots are named for whose unit takes the result: the first
    // player's blow lands first, so the order they are carried out in
    // follows the initiative (§7.5.6).
    const full = baseMeleeGameState('white');
    const event = meleeEvent({ unitReversed: true });

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);

    // White holds the initiative, so its unit's reverse is the first
    // player's, and Black's untouched unit is the second player's.
    expect(melee.attackOnFirstPlayerApplyState).toMatchObject({
      defendingUnit: whiteUnit,
      reverseState: 'pending',
    });
    expect(melee.attackOnSecondPlayerApplyState).toMatchObject({
      defendingUnit: blackUnit,
      reverseState: 'bypassed',
    });
  });
});
