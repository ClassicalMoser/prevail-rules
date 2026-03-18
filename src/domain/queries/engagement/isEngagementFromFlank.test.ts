import { describe, expect, it } from 'vitest';
import { isEngagementFromFlank } from './isEngagementFromFlank';

describe('isEngagementFromFlank', () => {
  it('should return success when the attacker faces orthogonal to the defender', () => {
    expect(isEngagementFromFlank('east', 'north')).toEqual({ result: true });
  });

  it('should return a helpful error when the attacker is not orthogonal to the defender', () => {
    expect(isEngagementFromFlank('south', 'north')).toEqual({
      result: false,
      errorReason: 'Attacker is not facing orthogonal to the defender',
    });
  });
});
