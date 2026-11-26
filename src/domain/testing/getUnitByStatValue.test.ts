import { getUnitByStatValue } from './getUnitByStatValue';

/** A stand-in unit type reached by the one stat a spec needs. */
describe('getUnitByStatValue function', () => {
  it('finds a stand-in by its Attack', () => {
    const unitType = getUnitByStatValue('attack', 3);
    expect(unitType.stats.attack).toBe(3);
  });

  it('finds a stand-in by its Flexibility', () => {
    const unitType = getUnitByStatValue('flexibility', 2);
    expect(unitType.stats.flexibility).toBe(2);
  });

  it('finds a stand-in by its Speed', () => {
    const unitType = getUnitByStatValue('speed', 3);
    expect(unitType.stats.speed).toBe(3);
  });

  it('refuses a value no stand-in has, naming it', () => {
    expect(() => getUnitByStatValue('attack', 999)).toThrow(
      'No unit found with attack value 999.',
    );
  });
});
