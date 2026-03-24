import { describe, expect, it } from 'vitest';
import { isEngagementFromFront } from './isEngagementFromFront';

/**
 * isEngagementFromFront: true when the attacker's facing is opposite the defender's (head-on engagement along
 * the defender's front).
 */
describe('isEngagementFromFront', () => {
  it('given attacker opposite defender, returns success', () => {
    expect(isEngagementFromFront('south', 'north')).toEqual({ result: true });
  });

  it('given attacker not opposite defender, returns false with reason', () => {
    expect(isEngagementFromFront('north', 'north')).toEqual({
      result: false,
      errorReason: 'Attacker is not facing opposite the defender',
    });
  });
});
