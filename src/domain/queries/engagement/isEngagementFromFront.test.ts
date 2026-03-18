import { describe, expect, it } from 'vitest';
import { isEngagementFromFront } from './isEngagementFromFront';

describe('isEngagementFromFront', () => {
  it('should return success when the attacker faces opposite the defender', () => {
    expect(isEngagementFromFront('south', 'north')).toEqual({ result: true });
  });

  it('should return a helpful error when the attacker does not face opposite the defender', () => {
    expect(isEngagementFromFront('north', 'north')).toEqual({
      result: false,
      errorReason: 'Attacker is not facing opposite the defender',
    });
  });
});
