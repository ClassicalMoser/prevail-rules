import type {
  GameState,
  StandardBoard,
  UnitPlacement,
  UnitWithPlacement,
} from '@entities';
import type { ResolveRangedAttackEvent } from '@events';
import { getRangedAttackResolutionState } from '@queries';
import {
  createEmptyGameState,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createTestCard,
  createTestUnit,
} from '@testing';
import { updateCardState, updatePhaseState } from '@transforms/pureTransforms';
import { describe, expect, it } from 'vitest';

import { applyResolveRangedAttackEvent } from './applyResolveRangedAttackEvent';

describe('applyResolveRangedAttackEvent', () => {
  function createRangedResolutionFixture(): {
    full: GameState<StandardBoard>;
    defender: ReturnType<typeof createTestUnit>;
    defenderWithPlacement: UnitWithPlacement<StandardBoard>;
  } {
    const base = createEmptyGameState();
    const withCards = updateCardState(base, (c) => ({
      ...c,
      white: { ...c.white, inPlay: createTestCard() },
      black: { ...c.black, inPlay: createTestCard() },
    }));
    const defender = createTestUnit('white', { attack: 2 });
    const defenderWithPlacement: UnitWithPlacement<StandardBoard> = {
      unit: defender,
      placement: { coordinate: 'E-5', facing: 'north' },
    };
    const ranged = createRangedAttackResolutionState(withCards, {
      defendingUnit: defender,
    });
    const full = updatePhaseState(
      withCards,
      createIssueCommandsPhaseState(withCards, {
        currentCommandResolutionState: ranged,
      }),
    );
    return { full, defender, defenderWithPlacement };
  }

  type RangedEventPatch = Partial<
    Omit<
      ResolveRangedAttackEvent<StandardBoard>,
      'defenderWithPlacement' | 'eventType' | 'effectType'
    >
  > &
    Pick<ResolveRangedAttackEvent<StandardBoard>, 'legalRetreatOptions'>;

  function rangedEvent(
    defenderWithPlacement: UnitWithPlacement<StandardBoard>,
    patch: RangedEventPatch,
  ): ResolveRangedAttackEvent<StandardBoard> {
    return {
      eventType: 'gameEffect',
      effectType: 'resolveRangedAttack',
      defenderWithPlacement,
      routed: false,
      retreated: false,
      reversed: false,
      ...patch,
    };
  }

  it('creates attack apply with no rout/retreat/reverse substeps when none apply', () => {
    const { full, defenderWithPlacement } = createRangedResolutionFixture();
    const event = rangedEvent(defenderWithPlacement, {
      legalRetreatOptions: new Set(),
    });

    const next = applyResolveRangedAttackEvent(event, full);
    const ra = getRangedAttackResolutionState(next);
    expect(ra.attackApplyState?.routState).toBeUndefined();
    expect(ra.attackApplyState?.retreatState).toBeUndefined();
    expect(ra.attackApplyState?.reverseState).toBeUndefined();
  });

  it('creates attack apply with reverse substep when reversed', () => {
    const { full, defenderWithPlacement } = createRangedResolutionFixture();
    const event = rangedEvent(defenderWithPlacement, {
      legalRetreatOptions: new Set(),
      reversed: true,
    });

    const next = applyResolveRangedAttackEvent(event, full);
    const ra = getRangedAttackResolutionState(next);
    expect(ra.attackApplyState?.attackResult.unitReversed).toBe(true);
    expect(ra.attackApplyState?.reverseState?.substepType).toBe('reverse');
  });

  it('creates rout substep when routed', () => {
    const { full, defender, defenderWithPlacement } =
      createRangedResolutionFixture();
    const event = rangedEvent(defenderWithPlacement, {
      legalRetreatOptions: new Set(),
      routed: true,
    });

    const next = applyResolveRangedAttackEvent(event, full);
    const ra = getRangedAttackResolutionState(next);
    expect(ra.attackApplyState?.routState?.substepType).toBe('rout');
    expect(ra.attackApplyState?.routState?.unitsToRout.has(defender)).toBe(
      true,
    );
  });

  it('creates retreat substep with finalPosition when exactly one legal retreat', () => {
    const { full, defenderWithPlacement } = createRangedResolutionFixture();
    const onlyOption = {
      coordinate: 'E-6' as const,
      facing: 'south' as const,
    };
    const event = rangedEvent(defenderWithPlacement, {
      legalRetreatOptions: new Set([onlyOption]),
      retreated: true,
    });

    const next = applyResolveRangedAttackEvent(event, full);
    const ra = getRangedAttackResolutionState(next);
    expect(ra.attackApplyState?.retreatState?.finalPosition).toEqual(
      onlyOption,
    );
  });

  it.each<{
    description: string;
    legalRetreatOptions: Set<UnitPlacement<StandardBoard>>;
  }>([
    {
      description: 'multiple legal retreats',
      legalRetreatOptions: new Set([
        { coordinate: 'E-6', facing: 'south' },
        { coordinate: 'E-4', facing: 'south' },
      ]),
    },
    {
      description: 'no legal retreat options',
      legalRetreatOptions: new Set(),
    },
  ])(
    'creates retreat substep with undefined finalPosition when $description',
    ({ legalRetreatOptions }) => {
      const { full, defenderWithPlacement } = createRangedResolutionFixture();
      const event = rangedEvent(defenderWithPlacement, {
        legalRetreatOptions,
        retreated: true,
      });

      const next = applyResolveRangedAttackEvent(event, full);
      const ra = getRangedAttackResolutionState(next);
      expect(ra.attackApplyState?.retreatState?.finalPosition).toBeUndefined();
    },
  );
});
