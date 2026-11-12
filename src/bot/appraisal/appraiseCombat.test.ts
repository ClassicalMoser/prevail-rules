import { createTestUnit } from '@testing';
import { lossFromResult } from './appraiseCombat';

/**
 * What an attack costs the unit it lands on: a rout most, then a reverse, then a
 * retreat, and nothing if it meets no threshold.
 */
describe('lossFromResult function', () => {
  const unit = createTestUnit('white', { attack: 4 });
  const result = (retreated: boolean, reversed: boolean, routed: boolean) =>
    lossFromResult(unit, {
      unitRetreated: retreated,
      unitReversed: reversed,
      unitRouted: routed,
    });

  it('costs nothing when no threshold is met', () => {
    expect(result(false, false, false)).toBe(0);
  });

  it('weighs a rout above a reverse, and a reverse above a retreat', () => {
    expect(result(false, false, true)).toBeGreaterThan(
      result(false, true, false),
    );
    expect(result(false, true, false)).toBeGreaterThan(
      result(true, false, false),
    );
  });

  it('charges a routed unit its cost and its Morale in cards', () => {
    // A rout takes the unit and makes its owner pay its Morale (§9.3).
    const { cost, morale } = unit.unitType;
    expect(result(false, false, true)).toBeGreaterThan(cost);
    expect(morale).toBeGreaterThan(0);
  });
});
