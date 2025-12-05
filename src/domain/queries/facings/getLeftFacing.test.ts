import type { UnitFacing } from '@entities';
import { getLeftFacing } from '@queries';
import { describe, expect, it } from 'vitest';

describe('getLeftFacing', () => {
  it('should return west for north', () => {
    expect(getLeftFacing('north')).toBe('west');
  });
  it('should return northWest for northEast', () => {
    expect(getLeftFacing('northEast')).toBe('northWest');
  });
  it('should return north for east', () => {
    expect(getLeftFacing('east')).toBe('north');
  });
  it('should return northEast for southEast', () => {
    expect(getLeftFacing('southEast')).toBe('northEast');
  });
  it('should return east for south', () => {
    expect(getLeftFacing('south')).toBe('east');
  });
  it('should return southEast for southWest', () => {
    expect(getLeftFacing('southWest')).toBe('southEast');
  });
  it('should return south for west', () => {
    expect(getLeftFacing('west')).toBe('south');
  });
  it('should return southWest for northWest', () => {
    expect(getLeftFacing('northWest')).toBe('southWest');
  });
  it('should throw an error for an invalid facing', () => {
    expect(() => getLeftFacing('invalid' as UnitFacing)).toThrow(
      'Invalid facing: invalid',
    );
  });
});
