import { createTestUnit } from '@testing/unitHelpers';
import { createEngagedUnitPresence } from './createEngagedUnitPresence';

describe('createEngagedUnitPresence function', () => {
  it('given context, returns engaged unit presence', () => {
    const primary = createTestUnit('black');
    const secondary = createTestUnit('white');
    const presence = createEngagedUnitPresence(primary, 'north', secondary);
    expect(presence.presenceType).toBe('engaged');
    expect(presence.primaryUnit).toBe(primary);
    expect(presence.primaryFacing).toBe('north');
    expect(presence.secondaryUnit).toBe(secondary);
  });
});
