import type { UnitFacing } from '@entities';

import { getRightFacing } from './getRightFacing';

/**
 * Right facing: 90 degrees clockwise.
 */
describe(getRightFacing, () => {
  it('right of north is east', () => {
    expect(getRightFacing('north')).toBe('east');
  });

  it('right of northEast is southEast', () => {
    expect(getRightFacing('northEast')).toBe('southEast');
  });

  it('right of east is south', () => {
    expect(getRightFacing('east')).toBe('south');
  });

  it('right of southEast is southWest', () => {
    expect(getRightFacing('southEast')).toBe('southWest');
  });

  it('right of south is west', () => {
    expect(getRightFacing('south')).toBe('west');
  });

  it('right of southWest is northWest', () => {
    expect(getRightFacing('southWest')).toBe('northWest');
  });

  it('right of west is north', () => {
    expect(getRightFacing('west')).toBe('north');
  });

  it('right of northWest is northEast', () => {
    expect(getRightFacing('northWest')).toBe('northEast');
  });

  it('an unknown facing is rejected', () => {
    expect(() => getRightFacing('invalid' as UnitFacing)).toThrow(
      'Invalid facing: invalid',
    );
  });
});
