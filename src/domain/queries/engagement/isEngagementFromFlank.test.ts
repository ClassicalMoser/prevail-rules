import { isEngagementFromFlank } from './isEngagementFromFlank';

/**
 * Flank engagement: the attacker faces perpendicular to the defender.
 */
describe('isEngagementFromFlank function', () => {
  it('an attacker facing perpendicular right of the defender is a flank engagement', () => {
    // The defender faces north; the attacker faces east, across it.
    expect(isEngagementFromFlank('east', 'north')).toBe(true);
  });

  it('an attacker facing perpendicular left of the defender is a flank engagement', () => {
    // The defender faces north; the attacker faces west, across it.
    expect(isEngagementFromFlank('west', 'north')).toBe(true);
  });

  it('an attacker facing the defender head-on is not a flank engagement', () => {
    // Looking straight back at the defender is a front engagement.
    expect(isEngagementFromFlank('south', 'north')).toBe(false);
  });

  it('an attacker facing the same way as the defender is not a flank engagement', () => {
    // Looking the way the defender looks is a rear engagement.
    expect(isEngagementFromFlank('north', 'north')).toBe(false);
  });
});
