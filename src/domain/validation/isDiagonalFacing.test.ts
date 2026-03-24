import type { UnitFacing } from '@entities';
import { describe, expect, it } from 'vitest';
import { isDiagonalFacing } from './isDiagonalFacing';

/**
 * isDiagonalFacing: validation rule; implementation in isDiagonalFacing.ts.
 */
describe('isDiagonalFacing', () => {
  it('should return true for a diagonal facing', () => {
    const { result } = isDiagonalFacing('northEast');
    expect(result).toBe(true);
  });
  it('should return false for an orthogonal facing', () => {
    const { result } = isDiagonalFacing('north');
    expect(result).toBe(false);
  });
  it('should return false for an invalid facing', () => {
    const { result } = isDiagonalFacing('invalid' as UnitFacing);
    expect(result).toBe(false);
  });
});
