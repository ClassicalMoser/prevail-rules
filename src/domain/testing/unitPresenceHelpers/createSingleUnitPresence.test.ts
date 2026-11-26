import { createTestUnit } from '@testing/unitHelpers';
import { createSingleUnitPresence } from './createSingleUnitPresence';

/** What a board space holds when one unit stands alone on it. */
describe('createSingleUnitPresence function', () => {
  it('holds that one unit, facing the way given', () => {
    const unit = createTestUnit('black');
    const presence = createSingleUnitPresence(unit, 'north');
    expect(presence.presenceType).toBe('single');
    expect(presence.unit).toBe(unit);
    expect(presence.facing).toBe('north');
  });
});
