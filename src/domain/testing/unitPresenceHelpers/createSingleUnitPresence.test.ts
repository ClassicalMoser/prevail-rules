import { createTestUnit } from '@testing/unitHelpers';
import { createSingleUnitPresence } from './createSingleUnitPresence';

describe('createSingleUnitPresence function', () => {
  it('given context, returns single unit presence', () => {
    const unit = createTestUnit('black');
    const presence = createSingleUnitPresence(unit, 'north');
    expect(presence.presenceType).toBe('single');
    expect(presence.unit).toBe(unit);
    expect(presence.facing).toBe('north');
  });
});
