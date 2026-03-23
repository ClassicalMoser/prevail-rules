import type { GameState, StandardBoard, UnitWithPlacement } from '@entities';
import type { ResolveMeleeEvent } from '@events';
import { getMeleeResolutionState } from '@queries';
import {
  createEmptyGameState,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createTestCard,
  createTestUnit,
} from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';

import { applyResolveMeleeEvent } from './applyResolveMeleeEvent';

describe('applyResolveMeleeEvent', () => {
  function baseMeleeGameState(): GameState<StandardBoard> {
    const base = createEmptyGameState();
    const withCards = updateCardState(base, (c) => ({
      ...c,
      white: { ...c.white, inPlay: createTestCard() },
      black: { ...c.black, inPlay: createTestCard() },
    }));
    const melee = createMeleeResolutionState(withCards);
    return updatePhaseState(
      withCards,
      createResolveMeleePhaseState(withCards, {
        currentMeleeResolutionState: melee,
      }),
    );
  }

  function unitPlacements(): {
    whiteUnitWithPlacement: UnitWithPlacement<StandardBoard>;
    blackUnitWithPlacement: UnitWithPlacement<StandardBoard>;
  } {
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    return {
      whiteUnitWithPlacement: {
        unit: whiteUnit,
        placement: { coordinate: 'E-5', facing: 'north' },
      },
      blackUnitWithPlacement: {
        unit: blackUnit,
        placement: { coordinate: 'E-5', facing: 'south' },
      },
    };
  }

  function baseMeleeEvent(
    placements: ReturnType<typeof unitPlacements>,
  ): ResolveMeleeEvent<StandardBoard> {
    return {
      eventType: 'gameEffect',
      effectType: 'resolveMelee',
      location: 'E-5',
      whiteUnitWithPlacement: placements.whiteUnitWithPlacement,
      blackUnitWithPlacement: placements.blackUnitWithPlacement,
      whiteLegalRetreatOptions: new Set(),
      blackLegalRetreatOptions: new Set(),
      whiteUnitRouted: false,
      blackUnitRouted: false,
      whiteUnitRetreated: false,
      blackUnitRetreated: false,
      whiteUnitReversed: false,
      blackUnitReversed: false,
    };
  }

  it('sets both attack-apply states undefined when no rout/retreat/reverse', () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const event = baseMeleeEvent(placements);

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    expect(melee.whiteAttackApplyState).toBeUndefined();
    expect(melee.blackAttackApplyState).toBeUndefined();
  });

  it('creates reverse substep when whiteUnitReversed is true', () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const event: ResolveMeleeEvent<StandardBoard> = {
      ...baseMeleeEvent(placements),
      whiteUnitReversed: true,
    };

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    expect(melee.whiteAttackApplyState?.reverseState?.substepType).toBe(
      'reverse',
    );
    expect(melee.blackAttackApplyState).toBeUndefined();
  });

  it('creates rout substep when a unit is routed', () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const event: ResolveMeleeEvent<StandardBoard> = {
      ...baseMeleeEvent(placements),
      whiteUnitRouted: true,
    };

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    expect(melee.whiteAttackApplyState?.routState?.substepType).toBe('rout');
    expect(melee.blackAttackApplyState).toBeUndefined();
  });

  it('creates retreat substep with finalPosition when exactly one legal retreat', () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const only = {
      coordinate: 'E-6' as const,
      facing: 'south' as const,
    };
    const event: ResolveMeleeEvent<StandardBoard> = {
      ...baseMeleeEvent(placements),
      whiteLegalRetreatOptions: new Set([only]),
      whiteUnitRetreated: true,
    };

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    expect(melee.whiteAttackApplyState?.retreatState?.finalPosition).toEqual(
      only,
    );
  });

  it('creates retreat substep with undefined finalPosition when multiple legal retreats', () => {
    const full = baseMeleeGameState();
    const placements = unitPlacements();
    const event: ResolveMeleeEvent<StandardBoard> = {
      ...baseMeleeEvent(placements),
      whiteLegalRetreatOptions: new Set([
        { coordinate: 'E-6', facing: 'south' },
        { coordinate: 'E-4', facing: 'south' },
      ]),
      whiteUnitRetreated: true,
    };

    const next = applyResolveMeleeEvent(event, full);
    const melee = getMeleeResolutionState(next);
    expect(
      melee.whiteAttackApplyState?.retreatState?.finalPosition,
    ).toBeUndefined();
  });
});
