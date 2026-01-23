import type { AttackApplyState } from '@entities';
import { createTestUnit } from '@testing';
import { describe, expect, it } from 'vitest';
import { getRoutStateFromAttackApply } from './rout';

describe('getRoutStateFromAttackApply', () => {
  it('should return rout state from attack apply state', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const attackApplyState: AttackApplyState<any> = {
      substepType: 'attackApply' as const,
      defendingUnit: unit,
      attackResult: {
        unitRouted: true,
        unitRetreated: false,
        unitReversed: false,
      },
      routState: {
        substepType: 'rout' as const,
        player: 'black' as const,
        unitsToRout: new Set([unit]),
        numberToDiscard: 1,
        cardsChosen: false,
        completed: false,
      },
      retreatState: undefined,
      reverseState: undefined,
      completed: false,
    };

    const result = getRoutStateFromAttackApply(attackApplyState);
    expect(result.substepType).toBe('rout');
    expect(result.player).toBe('black');
    expect(result.unitsToRout.has(unit)).toBe(true);
  });

  it('should throw error when rout state is missing', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const attackApplyState: AttackApplyState<any> = {
      substepType: 'attackApply' as const,
      defendingUnit: unit,
      attackResult: {
        unitRouted: false,
        unitRetreated: false,
        unitReversed: false,
      },
      routState: undefined,
      retreatState: undefined,
      reverseState: undefined,
      completed: false,
    };

    expect(() => getRoutStateFromAttackApply(attackApplyState)).toThrow(
      'No rout state found in attack apply state',
    );
  });
});
