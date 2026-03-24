import type { UnitFacing } from '@entities';
import { describe, expect, it } from 'vitest';
import { getRightFacing } from './getRightFacing';

/**
 * getRightFacing: maps a unit facing to the facing 45° clockwise (right relative to the unit's front arc).
 */
describe('getRightFacing', () => {
  it('given north, returns east', () => {
    expect(getRightFacing('north')).toBe('east');
  });
  it('given northEast, returns southEast', () => {
    expect(getRightFacing('northEast')).toBe('southEast');
  });
  it('given east, returns south', () => {
    expect(getRightFacing('east')).toBe('south');
  });
  it('given southEast, returns southWest', () => {
    expect(getRightFacing('southEast')).toBe('southWest');
  });
  it('given south, returns west', () => {
    expect(getRightFacing('south')).toBe('west');
  });
  it('given southWest, returns northWest', () => {
    expect(getRightFacing('southWest')).toBe('northWest');
  });
  it('given west, returns north', () => {
    expect(getRightFacing('west')).toBe('north');
  });
  it('given northWest, returns northEast', () => {
    expect(getRightFacing('northWest')).toBe('northEast');
  });
  it('given invalid facing, throws', () => {
    expect(() => getRightFacing('invalid' as UnitFacing)).toThrow(
      'Invalid facing: invalid',
    );
  });
});
