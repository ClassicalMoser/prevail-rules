import { createEmptyGameState } from '@factories';
import { createTestUnit, withReservedUnits } from '@testing';

import { getReservedUnit } from './getReservedUnit';

/**
 * A setup choice names a unit by who it is; the reserve says what it is
 * (§3.1, §3.5.1).
 */
describe('getReservedUnit function', () => {
  // White's one unit, waiting in reserve with Attack 3.
  const unit = createTestUnit('white', { attack: 3 });
  const waiting = withReservedUnits(createEmptyGameState('standard'), [unit]);

  it('returns the reserve’s stats, not the ones it was named with', () => {
    // A client names the same unit (same side, type and number) claiming
    // Attack 99.
    const claimed = {
      ...unit,
      unitType: {
        ...unit.unitType,
        stats: { ...unit.unitType.stats, attack: 99 },
      },
    };

    const held = getReservedUnit(waiting, claimed);

    // Who it is came from the name; what it is came from the reserve.
    expect(held.unitType.stats.attack).toBe(3);
  });

  it('throws for a unit not in reserve', () => {
    // Another white unit of the same type, never in reserve.
    const stranger = createTestUnit('white', { attack: 3, instanceNumber: 2 });

    expect(() => getReservedUnit(waiting, stranger)).toThrow(
      'Unit not present in reserve',
    );
  });
});
