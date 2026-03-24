import { describe, expect, it } from 'vitest';
import { getOppositeFacing } from './getOppositeFacing';

/**
 * getOppositeFacing: maps a facing to the one 180° opposite on the eight-direction compass.
 */
describe('getOppositeFacing', () => {
  it('given north, returns south', () => {
    expect(getOppositeFacing('north')).toBe('south');
  });
  it('given northEast, returns southWest', () => {
    expect(getOppositeFacing('northEast')).toBe('southWest');
  });
  it('given east, returns west', () => {
    expect(getOppositeFacing('east')).toBe('west');
  });
  it('given southEast, returns northWest', () => {
    expect(getOppositeFacing('southEast')).toBe('northWest');
  });
  it('given south, returns north', () => {
    expect(getOppositeFacing('south')).toBe('north');
  });
  it('given southWest, returns northEast', () => {
    expect(getOppositeFacing('southWest')).toBe('northEast');
  });
  it('given west, returns east', () => {
    expect(getOppositeFacing('west')).toBe('east');
  });
  it('given northWest, returns southEast', () => {
    expect(getOppositeFacing('northWest')).toBe('southEast');
  });
});
