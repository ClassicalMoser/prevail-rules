import { isEngagementFromFlank } from './isEngagementFromFlank';

/**
 * IsEngagementFromFlank: true when the attacker's facing is orthogonal to the defender's (flank engagement).
 */
describe(isEngagementFromFlank, () => {
  it('given attacker orthogonal to defender, returns success', () => {
    expect(isEngagementFromFlank('east', 'north')).toStrictEqual({
      result: true,
    });
  });

  it('given attacker not orthogonal to defender, returns false with reason', () => {
    expect(isEngagementFromFlank('south', 'north')).toStrictEqual({
      errorReason: 'Attacker is not facing orthogonal to the defender',
      result: false,
    });
  });
});
