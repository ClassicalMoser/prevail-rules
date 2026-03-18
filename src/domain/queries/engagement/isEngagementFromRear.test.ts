import { describe, expect, it } from 'vitest';
import { isEngagementFromRear } from './isEngagementFromRear';

describe('isEngagementFromRear', () => {
  it('should return success when the attacker faces the defender or an adjacent facing', () => {
    expect(isEngagementFromRear('north', 'north')).toEqual({ result: true });
  });

  it('should return a helpful error when the attacker is not close enough in facing', () => {
    expect(isEngagementFromRear('south', 'north')).toEqual({
      result: false,
      errorReason: 'Attacker is not facing a similar direction to the defender',
    });
  });
});
