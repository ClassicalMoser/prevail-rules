import { describe, expect, it } from 'vitest';
import { getUnitByStatValue } from './getUnitByStatValue';

describe('getUnitByStatValue', () => {
  it('should return unit type matching attack value', () => {
    const unitType = getUnitByStatValue('attack', 3);
    expect(unitType).toBeDefined();
    expect(unitType.stats.attack).toBe(3);
  });

  it('should return unit type matching flexibility value', () => {
    const unitType = getUnitByStatValue('flexibility', 2);
    expect(unitType).toBeDefined();
    expect(unitType.stats.flexibility).toBe(2);
  });

  it('should return unit type matching speed value', () => {
    const unitType = getUnitByStatValue('speed', 3);
    expect(unitType).toBeDefined();
    expect(unitType.stats.speed).toBe(3);
  });

  it('should throw when no unit has the given stat value', () => {
    expect(() => getUnitByStatValue('attack', 999)).toThrow(
      'No unit found with attack value 999.',
    );
  });
});
