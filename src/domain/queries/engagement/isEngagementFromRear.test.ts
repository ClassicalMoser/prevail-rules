import { isEngagementFromRear } from './isEngagementFromRear';

/**
 * Rear engagement: the attacker faces the same way as the defender, or one facing off that way.
 */
describe('isEngagementFromRear function', () => {
  it('an attacker facing the same way as the defender is a rear engagement', () => {
    expect(isEngagementFromRear('north', 'north')).toBe(true);
  });

  it('an attacker one facing off the defender is a rear engagement', () => {
    expect(isEngagementFromRear('northEast', 'north')).toBe(true);
  });

  it('an attacker facing the defender is not a rear engagement', () => {
    expect(isEngagementFromRear('south', 'north')).toBe(false);
  });

  it('an attacker facing orthogonally to the defender is not a rear engagement', () => {
    expect(isEngagementFromRear('north', 'east')).toBe(false);
  });
});
