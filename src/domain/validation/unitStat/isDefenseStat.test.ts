import type { UnitStatName } from '@entities';

import { describe, expect, it } from 'vitest';
import { isDefenseStat } from './isDefenseStat';

describe('isDefenseStat', () => {
  it('should return true for defense stats', () => {
    expect(isDefenseStat('reverse')).toBe(true);
    expect(isDefenseStat('retreat')).toBe(true);
    expect(isDefenseStat('rout')).toBe(true);
  });
  it('should return false for non-defense stats', () => {
    expect(isDefenseStat('attack')).toBe(false);
    expect(isDefenseStat('speed')).toBe(false);
    expect(isDefenseStat('defense' as UnitStatName)).toBe(false);
  });
});
