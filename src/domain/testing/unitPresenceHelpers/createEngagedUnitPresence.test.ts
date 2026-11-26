import { createTestUnit } from '@testing/unitHelpers';
import { createEngagedUnitPresence } from './createEngagedUnitPresence';

/** What a board space holds when two enemy units are engaged in it (§2.2.1). */
describe('createEngagedUnitPresence function', () => {
  it('holds both units, keeping only the primary’s facing', () => {
    const primary = createTestUnit('black');
    const secondary = createTestUnit('white');
    const presence = createEngagedUnitPresence(primary, 'north', secondary);
    expect(presence.presenceType).toBe('engaged');
    expect(presence.primaryUnit).toBe(primary);
    expect(presence.primaryFacing).toBe('north');
    expect(presence.secondaryUnit).toBe(secondary);
  });
});
