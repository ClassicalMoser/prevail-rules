import { isEngagementFromFront } from './isEngagementFromFront';

/**
 * Front engagement: the attacker faces opposite the defender.
 */
describe('isEngagementFromFront function', () => {
  it('an attacker facing the defender is a front engagement', () => {
    expect(isEngagementFromFront('south', 'north')).toBe(true);
  });

  it('an attacker nearly facing the defender is not a front engagement', () => {
    expect(isEngagementFromFront('north', 'southEast')).toBe(false);
  });

  it('an attacker facing orthogonally to the defender is not a front engagement', () => {
    expect(isEngagementFromFront('north', 'east')).toBe(false);
  });

  it('an attacker facing the same way as the defender is not a front engagement', () => {
    expect(isEngagementFromFront('north', 'north')).toBe(false);
  });

  it('an attacker facing one facing off head-on is not a front engagement', () => {
    expect(isEngagementFromFront('north', 'southWest')).toBe(false);
  });
});
