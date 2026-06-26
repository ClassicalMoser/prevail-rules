import type { StandardBoard, UnitWithPlacement } from '@entities';
import type { ResolveMeleeEventForBoard } from '@events';
import type { GameStateForBoard } from '@game';
import { getMeleeResolutionState } from '@queries';
import {
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestCard,
  createTestUnit,
  updateCardState,
} from '@testing';
import { updatePhaseState } from '@transforms/pureTransforms';
import { throwIfPending } from '@utils';

import { applyResolveMeleeEvent } from './applyResolveMeleeEvent';

/**
 * Materializes procedure `resolveMelee` into per-side `attackApplyState` substeps (rout,
 * retreat with optional auto final hex, reverse) or clears applies when nothing branches.
 */
describe(applyResolveMeleeEvent, () => {
  /** ResolveMelee phase with default melee CRS and both inPlay command cards set. */
  function baseMeleeGameState(): GameStateForBoard<StandardBoard> {
    const base = createEmptyGameState();
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
    whiteUnitWithPlacement: UnitWithPlacement<StandardBoard>;
    blackUnitWithPlacement: UnitWithPlacement<StandardBoard>;
  } {
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    return {
      blackUnitWithPlacement: {
        boardType: 'standard' as const,
        placement: {
          boardType: 'standard' as const,
          coordinate: 'E-5',
          facing: 'south',
        },
        unit: blackUnit,
      },
      whiteUnitWithPlacement: {
        boardType: 'standard' as const,
        placement: {
          boardType: 'standard' as const,
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
  ): ResolveMeleeEventForBoard<StandardBoard> {
    return {
      blackLegalRetreatOptions: [],
      blackUnitRetreated: false,
      blackUnitReversed: false,
      blackUnitRouted: false,
      blackUnitWithPlacement: placements.blackUnitWithPlacement,
      boardType: 'standard',
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

  it('given flat melee outcome flags, neither side gets an attackApplyState', () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const event = baseMeleeEvent(placements);

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    expect(melee.whiteAttackApplyState).toBe('pending');
    expect(melee.blackAttackApplyState).toBe('pending');
  });

  it('given whiteUnitReversed true, white apply gains reverse substep and black stays undefined', () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const event: ResolveMeleeEventForBoard<StandardBoard> = {
      ...baseMeleeEvent(placements),
      whiteUnitReversed: true,
    };

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    const whiteApply = throwIfPending(melee.whiteAttackApplyState, 'apply');
    expect(throwIfPending(whiteApply.reverseState, 'reverse').substepType).toBe(
      'reverse',
    );
    expect(melee.blackAttackApplyState).toBe('pending');
  });

  it('given whiteUnitRouted true, white apply gains rout substep', () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const event: ResolveMeleeEventForBoard<StandardBoard> = {
      ...baseMeleeEvent(placements),
      whiteUnitRouted: true,
    };

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    const whiteApply = throwIfPending(melee.whiteAttackApplyState, 'apply');
    expect(throwIfPending(whiteApply.routState, 'rout').substepType).toBe(
      'rout',
    );
    expect(melee.blackAttackApplyState).toBe('pending');
  });

  it('given white retreated with one legal hex E-6 south, retreat finalPosition auto-fills', () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const only = {
      boardType: 'standard' as const,
      coordinate: 'E-6' as const,
      facing: 'south' as const,
    };
    const event: ResolveMeleeEventForBoard<StandardBoard> = {
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
    const event: ResolveMeleeEventForBoard<StandardBoard> = {
      ...baseMeleeEvent(placements),
      whiteLegalRetreatOptions: [
        { boardType: 'standard' as const, coordinate: 'E-6', facing: 'south' },
        { boardType: 'standard' as const, coordinate: 'E-4', facing: 'south' },
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
