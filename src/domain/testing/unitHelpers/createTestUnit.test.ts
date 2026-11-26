import { tempUnits } from '@sampleValues';
import { createTestUnit } from './createTestUnit';

/** A stand-in unit, chosen by type or by the stats a spec asks for. */
describe('createTestUnit function', () => {
  it('deals the side the first stand-in of Attack 3 when asked for nothing', () => {
    const unit = createTestUnit('black');
    expect(unit.playerSide).toBe('black');
    expect(unit.instanceNumber).toBe(1);
    expect(unit.unitType.stats.attack).toBe(3);
  });

  it('numbers the unit as a spec asks', () => {
    const unit = createTestUnit('white', { instanceNumber: 5 });
    expect(unit.instanceNumber).toBe(5);
  });

  it('takes a unit type the spec names outright', () => {
    const unitType = tempUnits[0];
    const unit = createTestUnit('black', { unitType });
    expect(unit.unitType).toBe(unitType);
    expect(unit.playerSide).toBe('black');
  });

  it('chooses the unit by a stat a spec asks for', () => {
    const unit = createTestUnit('white', { attack: 2 });
    expect(unit.unitType.stats.attack).toBe(2);
  });

  it('refuses a stat value no stand-in has, naming it', () => {
    expect(() => createTestUnit('black', { attack: 999 })).toThrow(
      'No unit found matching all specified stats: attack=999.',
    );
  });

  it('chooses a unit that has every stat value asked for', () => {
    const unit = createTestUnit('black', { attack: 2, range: 1 });
    expect(unit.unitType.stats.attack).toBe(2);
    expect(unit.unitType.stats.range).toBe(1);
  });

  it('a unit can be asked for by the Morale its rout costs', () => {
    // Morale sits on the unit type, not among its stats (§9.3).
    const unit = createTestUnit('white', { morale: 0 });
    expect(unit.unitType.morale).toBe(0);
  });

  it('a Morale no catalog unit has is refused like any other value', () => {
    expect(() => createTestUnit('black', { morale: 99 })).toThrow(
      'No unit found matching all specified stats: morale=99.',
    );
  });
});
