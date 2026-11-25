import { isEngagementFromRear } from './isEngagementFromRear';

/**
 * Rear engagement: the attacker faces the same way as the defender, or one facing off that way.
 */
describe('isEngagementFromRear function', () => {
  it('an attacker facing the same way as the defender is a rear engagement', () => {
    // Both face north: the attacker came from behind.
    expect(isEngagementFromRear('north', 'north')).toBe(true);
  });

  it('an attacker one facing off the defender, to either side, is a rear engagement', () => {
    // Facing 45° off the defender's own facing is still coming from behind.
    expect(isEngagementFromRear('northEast', 'north')).toBe(true);
    expect(isEngagementFromRear('northWest', 'north')).toBe(true);
  });

  it('an attacker facing the defender is not a rear engagement', () => {
    // Looking straight back at the defender is a front engagement.
    expect(isEngagementFromRear('south', 'north')).toBe(false);
  });

  it('an attacker facing orthogonally to the defender is not a rear engagement', () => {
    // Looking across the defender is a flank engagement.
    expect(isEngagementFromRear('north', 'east')).toBe(false);
  });
});
