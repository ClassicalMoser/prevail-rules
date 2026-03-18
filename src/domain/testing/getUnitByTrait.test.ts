import type { Trait } from '@ruleValues';
import { describe, expect, it } from 'vitest';
import { getUnitByTrait } from './getUnitByTrait';

describe('getUnitByTrait', () => {
  it('should return unit type with single trait', () => {
    const unitType = getUnitByTrait('formation');
    expect(unitType).toBeDefined();
    expect(unitType.traits).toContain('formation');
  });

  it('should return unit type with all given traits', () => {
    const unitType = getUnitByTrait('formation', 'sword');
    expect(unitType).toBeDefined();
    expect(unitType.traits).toContain('formation');
    expect(unitType.traits).toContain('sword');
  });

  it('should throw when no unit has the trait', () => {
    // Use bad cast to trigger type error
    expect(() => getUnitByTrait('nonexistent' as Trait)).toThrow(
      'No unit found with trait "nonexistent".',
    );
  });

  it('should throw when no unit has all traits', () => {
    // Use bad cast to trigger type error
    expect(() => getUnitByTrait('formation', 'nonexistent' as Trait)).toThrow(
      'No unit found with traits ["formation", "nonexistent"].',
    );
  });
});
