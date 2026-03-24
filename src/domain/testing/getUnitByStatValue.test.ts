import { describe, expect, it } from 'vitest';
import { getUnitByStatValue } from './getUnitByStatValue';

/**
 * getUnitByStatValue: Finds a unit type by matching a specific stat value.
 */
describe('getUnitByStatValue', () => {
  it('given context, returns unit type matching attack value', () => {
    const unitType = getUnitByStatValue('attack', 3);
    expect(unitType).toBeDefined();
    expect(unitType.stats.attack).toBe(3);
  });

  it('given context, returns unit type matching flexibility value', () => {
    const unitType = getUnitByStatValue('flexibility', 2);
    expect(unitType).toBeDefined();
    expect(unitType.stats.flexibility).toBe(2);
  });

  it('given context, returns unit type matching speed value', () => {
    const unitType = getUnitByStatValue('speed', 3);
    expect(unitType).toBeDefined();
    expect(unitType.stats.speed).toBe(3);
  });

  it('given when no unit has the given stat value, throws', () => {
    expect(() => getUnitByStatValue('attack', 999)).toThrow(
      'No unit found with attack value 999.',
    );
  });
});
