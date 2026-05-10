import { isEngagementFromFront } from './isEngagementFromFront';

/**
 * IsEngagementFromFront: true when the attacker's facing is opposite the defender's (head-on engagement along
 * the defender's front).
 */
describe(isEngagementFromFront, () => {
  it('given attacker opposite defender, returns success', () => {
    expect(isEngagementFromFront('south', 'north')).toStrictEqual({
      result: true,
    });
  });

  it('given attacker not opposite defender, returns false with reason', () => {
    expect(isEngagementFromFront('north', 'north')).toStrictEqual({
      errorReason: 'Attacker is not facing opposite the defender',
      result: false,
    });
  });
});
