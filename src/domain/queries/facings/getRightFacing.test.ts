import type { UnitFacing } from '@entities';
import { describe, expect, it } from 'vitest';
import { getRightFacing } from './getRightFacing';

describe('getRightFacing', () => {
  it('should return east for north', () => {
    expect(getRightFacing('north')).toBe('east');
  });
  it('should return southEast for northEast', () => {
    expect(getRightFacing('northEast')).toBe('southEast');
  });
  it('should return south for east', () => {
    expect(getRightFacing('east')).toBe('south');
  });
  it('should return southWest for southEast', () => {
    expect(getRightFacing('southEast')).toBe('southWest');
  });
  it('should return west for south', () => {
    expect(getRightFacing('south')).toBe('west');
  });
  it('should return northWest for southWest', () => {
    expect(getRightFacing('southWest')).toBe('northWest');
  });
  it('should return north for west', () => {
    expect(getRightFacing('west')).toBe('north');
  });
  it('should return northEast for northWest', () => {
    expect(getRightFacing('northWest')).toBe('northEast');
  });
  it('should throw an error for an invalid facing', () => {
    expect(() => getRightFacing('invalid' as UnitFacing)).toThrow(
      'Invalid facing: invalid',
    );
  });
});
