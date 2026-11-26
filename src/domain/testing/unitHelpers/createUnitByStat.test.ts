import { createUnitByStat } from './createUnitByStat';

describe('createUnitByStat function', () => {
  it('given defaults, creates unit by stat and value', () => {
    const unit = createUnitByStat('black', 'attack', 3);
    expect(unit.playerSide).toBe('black');
    expect(unit.unitType.stats.attack).toBe(3);
    expect(unit.instanceNumber).toBe(1);
  });

  it('given use custom instance number', () => {
    const unit = createUnitByStat('white', 'flexibility', 1, 2);
    expect(unit.instanceNumber).toBe(2);
  });

  it('given when no unit has stat value, throws', () => {
    expect(() => createUnitByStat('black', 'attack', 999)).toThrow(
      'No unit found with attack value 999.',
    );
  });
});
