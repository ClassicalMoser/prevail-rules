import type { Trait } from '@ruleValues';

import { getUnitByTrait } from './getUnitByTrait';

/** A stand-in unit type reached by its traits, as a card's trait restriction asks for every one listed. */
describe('getUnitByTrait function', () => {
  it('finds a stand-in with the trait asked for', () => {
    const unitType = getUnitByTrait('formation');
    expect(unitType.traits).toContain('formation');
  });

  it('finds a stand-in with every trait asked for', () => {
    const unitType = getUnitByTrait('formation', 'phalanx');
    expect(unitType.traits).toContain('formation');
    expect(unitType.traits).toContain('phalanx');
  });

  it('refuses a trait no stand-in has, naming it', () => {
    // Use bad cast to trigger type error
    expect(() => getUnitByTrait('nonexistent' as Trait)).toThrow(
      'No unit found with trait "nonexistent".',
    );
  });

  it('refuses traits no one stand-in has together, naming them', () => {
    // Use bad cast to trigger type error
    expect(() => getUnitByTrait('formation', 'nonexistent' as Trait)).toThrow(
      'No unit found with traits ["formation", "nonexistent"].',
    );
  });
});
