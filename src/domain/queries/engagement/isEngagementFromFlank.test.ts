import { isEngagementFromFlank } from './isEngagementFromFlank';

/**
 * Flank engagement: the attacker faces perpendicular to the defender.
 */
describe('isEngagementFromFlank function', () => {
  it('an attacker facing perpendicular right of the defender is a flank engagement', () => {
    expect(isEngagementFromFlank('east', 'north')).toBe(true);
  });

  it('an attacker facing perpendicular left of the defender is a flank engagement', () => {
    expect(isEngagementFromFlank('west', 'north')).toBe(true);
  });

  it('an attacker facing the defender head-on is not a flank engagement', () => {
    expect(isEngagementFromFlank('south', 'north')).toBe(false);
  });

  it('an attacker facing the same way as the defender is not a flank engagement', () => {
    expect(isEngagementFromFlank('north', 'north')).toBe(false);
  });
});
