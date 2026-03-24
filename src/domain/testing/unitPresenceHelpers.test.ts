import { describe, expect, it } from 'vitest';
import { createTestUnit } from './unitHelpers';
import {
  createEngagedUnitPresence,
  createNoneUnitPresence,
  createSingleUnitPresence,
} from './unitPresenceHelpers';

/**
 * createNoneUnitPresence: test helper; implementation in unitPresenceHelpers.ts.
 */
describe('createNoneUnitPresence', () => {
  it('should return none presence', () => {
    const presence = createNoneUnitPresence();
    expect(presence.presenceType).toBe('none');
  });
});

describe('createSingleUnitPresence', () => {
  it('should return single unit presence', () => {
    const unit = createTestUnit('black');
    const presence = createSingleUnitPresence(unit, 'north');
    expect(presence.presenceType).toBe('single');
    expect(presence.unit).toBe(unit);
    expect(presence.facing).toBe('north');
  });
});

describe('createEngagedUnitPresence', () => {
  it('should return engaged unit presence', () => {
    const primary = createTestUnit('black');
    const secondary = createTestUnit('white');
    const presence = createEngagedUnitPresence(primary, 'north', secondary);
    expect(presence.presenceType).toBe('engaged');
    expect(presence.primaryUnit).toBe(primary);
    expect(presence.primaryFacing).toBe('north');
    expect(presence.secondaryUnit).toBe(secondary);
  });
});
