import { createUnitByStat } from './createUnitByStat';

/** A stand-in unit chosen by a single stat. */
describe('createUnitByStat function', () => {
  it('deals the side the first stand-in with that stat value, numbered 1', () => {
    const unit = createUnitByStat('black', 'attack', 3);
    expect(unit.playerSide).toBe('black');
    expect(unit.unitType.stats.attack).toBe(3);
    expect(unit.instanceNumber).toBe(1);
  });

  it('numbers the unit as a spec asks', () => {
    const unit = createUnitByStat('white', 'flexibility', 1, 2);
    expect(unit.instanceNumber).toBe(2);
  });

  it('refuses a stat value no stand-in has, naming it', () => {
    expect(() => createUnitByStat('black', 'attack', 999)).toThrow(
      'No unit found with attack value 999.',
    );
  });
});
