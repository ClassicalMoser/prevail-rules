import type { UnitStatName } from '@entities';

import { describe, expect, it } from 'vitest';
import { isDefenseStat } from './isDefenseStat';

describe('isDefenseStat', () => {
  it('should return true for defense stats', () => {
    const { result: reverseResult } = isDefenseStat('reverse');
    expect(reverseResult).toBe(true);
    const { result: retreatResult } = isDefenseStat('retreat');
    expect(retreatResult).toBe(true);
    const { result: routResult } = isDefenseStat('rout');
    expect(routResult).toBe(true);
  });
  it('should return false for non-defense stats', () => {
    const { result: attackResult } = isDefenseStat('attack');
    expect(attackResult).toBe(false);
    const { result: rangeResult } = isDefenseStat('range');
    expect(rangeResult).toBe(false);
    const { result: speedResult } = isDefenseStat('speed');
    expect(speedResult).toBe(false);
    const { result: defenseResult } = isDefenseStat('defense' as UnitStatName);
    expect(defenseResult).toBe(false);
  });
});
