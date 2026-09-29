import type { UnitFacing } from '@entities';

import { getLeftFacing } from './getLeftFacing';

/**
 * Left facing: 90 degrees counterclockwise.
 */
describe(getLeftFacing, () => {
  it('left of north is west', () => {
    expect(getLeftFacing('north')).toBe('west');
  });

  it('left of northEast is northWest', () => {
    expect(getLeftFacing('northEast')).toBe('northWest');
  });

  it('left of east is north', () => {
    expect(getLeftFacing('east')).toBe('north');
  });

  it('left of southEast is northEast', () => {
    expect(getLeftFacing('southEast')).toBe('northEast');
  });

  it('left of south is east', () => {
    expect(getLeftFacing('south')).toBe('east');
  });

  it('left of southWest is southEast', () => {
    expect(getLeftFacing('southWest')).toBe('southEast');
  });

  it('left of west is south', () => {
    expect(getLeftFacing('west')).toBe('south');
  });

  it('left of northWest is southWest', () => {
    expect(getLeftFacing('northWest')).toBe('southWest');
  });

  it('an unknown facing is rejected', () => {
    expect(() => getLeftFacing('invalid' as UnitFacing)).toThrow(
      'Invalid facing: invalid',
    );
  });
});
