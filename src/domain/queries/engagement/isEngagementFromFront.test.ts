import { isEngagementFromFront } from './isEngagementFromFront';

/**
 * Front engagement: the attacker faces opposite the defender.
 */
describe(isEngagementFromFront, () => {
  it('an attacker facing the defender is a front engagement', () => {
    expect(isEngagementFromFront('south', 'north')).toStrictEqual({
      result: true,
    });
  });

  it('an attacker nearly facing the defender is not a front engagement', () => {
    expect(isEngagementFromFront('north', 'southEast')).toStrictEqual({
      errorReason: 'Attacker is not facing opposite the defender',
      result: false,
    });
  });

  it('an attacker facing orthogonally to the defender is not a front engagement', () => {
    expect(isEngagementFromFront('north', 'east')).toStrictEqual({
      errorReason: 'Attacker is not facing opposite the defender',
      result: false,
    });
  });

  it('an attacker facing the same way as the defender is not a front engagement', () => {
    expect(isEngagementFromFront('north', 'north')).toStrictEqual({
      errorReason: 'Attacker is not facing opposite the defender',
      result: false,
    });
  });

  it('an attacker facing one facing off the defender is a front engagement', () => {
    expect(isEngagementFromFront('north', 'southWest')).toStrictEqual({
      errorReason: 'Attacker is not facing opposite the defender',
      result: false,
    });
  });
});
