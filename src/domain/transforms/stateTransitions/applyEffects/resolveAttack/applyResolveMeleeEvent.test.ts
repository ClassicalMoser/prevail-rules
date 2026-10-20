import type { UnitWithPlacement } from '@entities';
import type { ResolveMeleeEvent } from '@events';
import type { GameState } from '@game';
import { getMeleeResolutionState } from '@queries';
import {
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestCard,
  createTestUnit,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { throwIfPending } from '@utils';

import { applyResolveMeleeEvent } from './applyResolveMeleeEvent';

import { createEmptyGameState } from '@factories';
/**
 * Materializes procedure `resolveMelee` into per-side `attackApplyState` values.
 * A miss writes a completed apply with rout, retreat, and reverse set to `'miss'`.
 * A hit opens the matching nested substep.
 */
describe('applyResolveMeleeEvent function', () => {
  /** ResolveMelee phase with default melee CRS and both inPlay command cards set. */
  function baseMeleeGameState(): GameState {
    const base = createEmptyGameState('standard');
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
      blackUnitWithPlacement: {
        placement: {
          coordinate: 'E-5',
          facing: 'south',
        },
        unit: blackUnit,
      },
      whiteUnitWithPlacement: {
        placement: {
          coordinate: 'E-5',
          facing: 'north',
        },
        unit: whiteUnit,
      },
    };
  }

  /** Neutral resolveMelee event: no rout/retreat/reverse, empty legal retreat sets. */
  function baseMeleeEvent(
    placements: ReturnType<typeof unitPlacements>,
  ): ResolveMeleeEvent {
    return {
      blackLegalRetreatOptions: [],
      blackUnitRetreated: false,
      blackUnitReversed: false,
      blackUnitRouted: false,
      blackUnitWithPlacement: placements.blackUnitWithPlacement,
      effectType: 'resolveMelee',
      eventNumber: 0,
      eventType: 'gameEffect',
      location: 'E-5',
      whiteLegalRetreatOptions: [],
      whiteUnitRetreated: false,
      whiteUnitReversed: false,
      whiteUnitRouted: false,
      whiteUnitWithPlacement: placements.whiteUnitWithPlacement,
    };
  }

  it('writes a completed miss apply for each side when neither unit is hit', () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const event = baseMeleeEvent(placements);

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    const whiteApply = throwIfPending(melee.whiteAttackApplyState, 'apply');
    const blackApply = throwIfPending(melee.blackAttackApplyState, 'apply');
    expect(whiteApply.completed).toBe(true);
    expect(whiteApply.routState).toBe('miss');
    expect(whiteApply.retreatState).toBe('miss');
    expect(whiteApply.reverseState).toBe('miss');
    expect(blackApply.completed).toBe(true);
    expect(blackApply.routState).toBe('miss');
    expect(blackApply.retreatState).toBe('miss');
    expect(blackApply.reverseState).toBe('miss');
  });

  it('opens a white reverse substep and a completed black miss when only white reverses', () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const event: ResolveMeleeEvent = {
      ...baseMeleeEvent(placements),
      whiteUnitReversed: true,
    };

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    const whiteApply = throwIfPending(melee.whiteAttackApplyState, 'apply');
    const blackApply = throwIfPending(melee.blackAttackApplyState, 'apply');
    expect(throwIfPending(whiteApply.reverseState, 'reverse').substepType).toBe(
      'reverse',
    );
    expect(blackApply.completed).toBe(true);
    expect(blackApply.routState).toBe('miss');
    expect(blackApply.retreatState).toBe('miss');
    expect(blackApply.reverseState).toBe('miss');
  });

  it('opens a white rout substep and a completed black miss when only white routes', () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const event: ResolveMeleeEvent = {
      ...baseMeleeEvent(placements),
      whiteUnitRouted: true,
    };

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    const whiteApply = throwIfPending(melee.whiteAttackApplyState, 'apply');
    const blackApply = throwIfPending(melee.blackAttackApplyState, 'apply');
    expect(throwIfPending(whiteApply.routState, 'rout').substepType).toBe(
      'rout',
    );
    expect(blackApply.completed).toBe(true);
    expect(blackApply.routState).toBe('miss');
    expect(blackApply.retreatState).toBe('miss');
    expect(blackApply.reverseState).toBe('miss');
  });

  it('given white retreated with one legal hex E-6 south, retreat finalPosition auto-fills', () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const only = {
      coordinate: 'E-6' as const,
      facing: 'south' as const,
    };
    const event: ResolveMeleeEvent = {
      ...baseMeleeEvent(placements),
      whiteLegalRetreatOptions: [only],
      whiteUnitRetreated: true,
    };

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    const whiteApply = throwIfPending(melee.whiteAttackApplyState, 'apply');
    expect(
      throwIfPending(whiteApply.retreatState, 'retreat').finalPosition,
    ).toStrictEqual(only);
  });

  it('given white retreated with two legal hexes, retreat finalPosition stays undefined', () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const event: ResolveMeleeEvent = {
      ...baseMeleeEvent(placements),
      whiteLegalRetreatOptions: [
        { coordinate: 'E-6', facing: 'south' },
        { coordinate: 'E-4', facing: 'south' },
      ],
      whiteUnitRetreated: true,
    };

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    const whiteApply = throwIfPending(melee.whiteAttackApplyState, 'apply');
    expect(
      throwIfPending(whiteApply.retreatState, 'retreat').finalPosition,
    ).toBe('pending');
  });
});
