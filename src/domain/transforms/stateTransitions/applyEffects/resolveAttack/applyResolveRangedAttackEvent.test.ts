import type { UnitInstance, UnitPlacement, UnitWithPlacement } from '@entities';
import type { ResolveRangedAttackEvent } from '@events';
import type { GameState } from '@game';
import { getRangedAttackResolutionState } from '@queries';
import {
  createEmptyGameState,
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
 * First strike resolution: builds `attackApplyState` on the ranged CRS from procedure flags—
 * attack result, optional rout / retreat (auto hex when unique) / reverse substeps.
 */
describe(applyResolveRangedAttackEvent, () => {
  /** IssueCommands + ranged CRS with white defender on E-5 and both inPlay cards. */
  function createRangedResolutionFixture(): {
    full: GameState;
    defender: UnitInstance;
    defenderWithPlacement: UnitWithPlacement;
  } {
    const base = createEmptyGameState();
    const withCards = updateCardState(base, {
      ...base.cardState,
      black: { ...base.cardState.black, inPlay: createTestCard() },
      white: { ...base.cardState.white, inPlay: createTestCard() },
    });
    const defender = createTestUnit('white', { attack: 2 });
    const defenderWithPlacement: UnitWithPlacement = {
      placement: {
        coordinate: 'E-5',
        facing: 'north',
      },
      unit: defender,
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
    return { defender, defenderWithPlacement, full };
  }

  type RangedEventPatch = Partial<
    Omit<
      ResolveRangedAttackEvent,
      'defenderWithPlacement' | 'eventType' | 'effectType'
    >
  > &
    Pick<ResolveRangedAttackEvent, 'legalRetreatOptions'>;

  /** Game effect merge: defaults plus patch (legalRetreatOptions required in patch). */
  function rangedEvent(
    defenderWithPlacement: UnitWithPlacement,
    patch: RangedEventPatch,
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

  it('given no branch flags and empty legal retreats, attackApply has no rout retreat reverse substeps', () => {
    const { full, defenderWithPlacement } = createRangedResolutionFixture();
    const event = rangedEvent(defenderWithPlacement, {
      legalRetreatOptions: [],
    });

    const next = applyResolveRangedAttackEvent(event, full);
    const ra = getRangedAttackResolutionState(next);
    const apply = throwIfPending(ra.attackApplyState, 'attack apply');
    expect(apply.routState).toBe('pending');
    expect(apply.retreatState).toBe('pending');
    expect(apply.reverseState).toBe('pending');
  });

  it('given reversed true, attackResult unitReversed and reverse substep present', () => {
    const { full, defenderWithPlacement } = createRangedResolutionFixture();
    const event = rangedEvent(defenderWithPlacement, {
      legalRetreatOptions: [],
      reversed: true,
    });

    const next = applyResolveRangedAttackEvent(event, full);
    const ra = getRangedAttackResolutionState(next);
    const apply = throwIfPending(ra.attackApplyState, 'attack apply');
    expect(apply.attackResult.unitReversed).toBeTruthy();
    expect(throwIfPending(apply.reverseState, 'reverse').substepType).toBe(
      'reverse',
    );
  });

  it('given routed true, rout substep lists defending unit instance', () => {
    const { full, defender, defenderWithPlacement } =
      createRangedResolutionFixture();
    const event = rangedEvent(defenderWithPlacement, {
      legalRetreatOptions: [],
      routed: true,
    });

    const next = applyResolveRangedAttackEvent(event, full);
    const ra = getRangedAttackResolutionState(next);
    const apply = throwIfPending(ra.attackApplyState, 'attack apply');
    const rout = throwIfPending(apply.routState, 'rout');
    expect(rout.substepType).toBe('rout');
    expect(rout.unitsToRout.includes(defender)).toBeTruthy();
  });

  it('given retreated with sole legal E-6 south, retreat finalPosition equals that placement', () => {
    const { full, defenderWithPlacement } = createRangedResolutionFixture();
    const onlyOption = {
      coordinate: 'E-6' as const,
      facing: 'south' as const,
    };
    const event = rangedEvent(defenderWithPlacement, {
      legalRetreatOptions: [onlyOption],
      retreated: true,
    });

    const next = applyResolveRangedAttackEvent(event, full);
    const ra = getRangedAttackResolutionState(next);
    const apply = throwIfPending(ra.attackApplyState, 'attack apply');
    expect(
      throwIfPending(apply.retreatState, 'retreat').finalPosition,
    ).toStrictEqual(onlyOption);
  });

  it.each<{
    description: string;
    legalRetreatOptions: UnitPlacement[];
  }>([
    {
      description: 'multiple legal retreats',
      legalRetreatOptions: [
        { coordinate: 'E-6', facing: 'south' },
        { coordinate: 'E-4', facing: 'south' },
      ],
    },
    {
      description: 'no legal retreat options',
      legalRetreatOptions: [],
    },
  ])(
    'given retreated true and $description, retreat finalPosition is undefined',
    ({ legalRetreatOptions }) => {
      const { full, defenderWithPlacement } = createRangedResolutionFixture();
      const event = rangedEvent(defenderWithPlacement, {
        legalRetreatOptions,
        retreated: true,
      });

      const next = applyResolveRangedAttackEvent(event, full);
      const ra = getRangedAttackResolutionState(next);
      const apply = throwIfPending(ra.attackApplyState, 'attack apply');
      expect(throwIfPending(apply.retreatState, 'retreat').finalPosition).toBe(
        'pending',
      );
    },
  );
});
