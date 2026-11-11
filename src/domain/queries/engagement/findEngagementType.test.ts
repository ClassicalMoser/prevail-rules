import { findEngagementType } from './findEngagementType';

/**
 * A unit that moves into an enemy meets it from the rear, the flank or the
 * front, by the way the two face (§6.3). The defender here faces north.
 */
describe('findEngagementType function', () => {
  it('meets a defender from the rear when it faces the same way, or a way beside it', () => {
    expect(findEngagementType('north', 'north')).toBe('rear');
    expect(findEngagementType('northEast', 'north')).toBe('rear');
    expect(findEngagementType('northWest', 'north')).toBe('rear');
  });

  it('meets a defender from the flank when it faces across it', () => {
    expect(findEngagementType('east', 'north')).toBe('flank');
    expect(findEngagementType('west', 'north')).toBe('flank');
  });

  it('meets a defender from the front when it faces it head on', () => {
    expect(findEngagementType('south', 'north')).toBe('front');
  });

  it('answers undefined for facings that meet in none of the three ways', () => {
    // A diagonal facing back toward the defender is neither across it nor
    // head on.
    expect(findEngagementType('southEast', 'north')).toBeUndefined();
    expect(findEngagementType('southWest', 'north')).toBeUndefined();
  });
});
