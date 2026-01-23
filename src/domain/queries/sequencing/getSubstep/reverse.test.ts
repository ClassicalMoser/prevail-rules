import type { AttackApplyState } from '@entities';
import { createTestUnit } from '@testing';
import { describe, expect, it } from 'vitest';
import { getReverseStateFromAttackApply } from './reverse';

describe('getReverseStateFromAttackApply', () => {
  it('should return reverse state from attack apply state', () => {
    const unit = createTestUnit('black', { attack: 2 });
    const attackApplyState: AttackApplyState<any> = {
      substepType: 'attackApply' as const,
      defendingUnit: unit,
      attackResult: {
        unitRouted: false,
        unitRetreated: false,
        unitReversed: true,
      },
      routState: undefined,
      retreatState: undefined,
      reverseState: {
        substepType: 'reverse' as const,
        reversingUnit: {
          unit,
          placement: { coordinate: 'E-5', facing: 'north' },
        },
        finalPosition: undefined,
        completed: false,
      },
      completed: false,
    };

    const result = getReverseStateFromAttackApply(attackApplyState);
    expect(result.substepType).toBe('reverse');
    expect(result.reversingUnit.unit).toEqual(unit);
  });

  it('should throw error when reverse state is missing', () => {
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

    expect(() => getReverseStateFromAttackApply(attackApplyState)).toThrow(
      'No reverse state found in attack apply state',
    );
  });
});
