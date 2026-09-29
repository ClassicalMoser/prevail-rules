import { isEngagementFromRear } from './isEngagementFromRear';

/**
 * Rear engagement: the attacker faces the same way as the defender, or one facing off that way.
 */
describe(isEngagementFromRear, () => {
  it('an attacker facing the same way as the defender is a rear engagement', () => {
    expect(isEngagementFromRear('north', 'north')).toStrictEqual({
      result: true,
    });
  });

  it('an attacker one facing off the defender is a rear engagement', () => {
    expect(isEngagementFromRear('northEast', 'north')).toStrictEqual({
      result: true,
    });
  });

  it('an attacker facing the defender is not a rear engagement', () => {
    expect(isEngagementFromRear('south', 'north')).toStrictEqual({
      errorReason: 'Attacker is not facing a similar direction to the defender',
      result: false,
    });
  });

  it('an attacker facing orthogonally to the defender is not a rear engagement', () => {
    expect(isEngagementFromRear('north', 'east')).toStrictEqual({
      errorReason: 'Attacker is not facing a similar direction to the defender',
      result: false,
    });
  });
});
