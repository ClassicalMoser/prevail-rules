import { isEngagementFromFront } from './isEngagementFromFront';

/**
 * Front engagement: the attacker faces opposite the defender.
 */
describe('isEngagementFromFront function', () => {
  it('an attacker facing the defender is a front engagement', () => {
    // The defender faces north; the attacker faces south, straight back at it.
    expect(isEngagementFromFront('south', 'north')).toBe(true);
  });

  it('an attacker facing 45° off head-on is not a front engagement', () => {
    // A front approach always squares up (§6.2.3); either side of straight
    // back at the defender is not head on.
    expect(isEngagementFromFront('north', 'southEast')).toBe(false);
    expect(isEngagementFromFront('north', 'southWest')).toBe(false);
  });

  it('an attacker facing orthogonally to the defender is not a front engagement', () => {
    // Looking across the defender is a flank engagement.
    expect(isEngagementFromFront('north', 'east')).toBe(false);
  });

  it('an attacker facing the same way as the defender is not a front engagement', () => {
    // Looking the way the defender looks is a rear engagement.
    expect(isEngagementFromFront('north', 'north')).toBe(false);
  });
});
