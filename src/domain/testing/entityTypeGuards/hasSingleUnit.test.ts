import { hasSingleUnit } from '@entities';
import { createTestUnit } from '@testing/unitHelpers';
import { createEngagedUnitPresence } from '@testing/unitPresenceHelpers';
import { describe, expect, it } from 'vitest';

/**
 * hasSingleUnit: test helper; implementation in hasSingleUnit.ts.
 */
describe('hasSingleUnit', () => {
  it('should return false for engaged unit presence', () => {
    const unit1 = createTestUnit('black', { attack: 3 });
    const unit2 = createTestUnit('white', { attack: 3 });
    const unitPresence = createEngagedUnitPresence(unit1, 'north', unit2);
    expect(hasSingleUnit(unitPresence)).toBe(false);
  });
});
