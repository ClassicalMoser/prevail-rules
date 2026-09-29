import type { UnitFacing } from '@entities';

import { getOppositeFacing } from './getOppositeFacing';

/**
 * Opposite facing: 180 degrees around the compass.
 */
describe(getOppositeFacing, () => {
  it('the opposite of north is south', () => {
    expect(getOppositeFacing('north')).toBe('south');
  });

  it('the opposite of northEast is southWest', () => {
    expect(getOppositeFacing('northEast')).toBe('southWest');
  });

  it('the opposite of east is west', () => {
    expect(getOppositeFacing('east')).toBe('west');
  });

  it('the opposite of southEast is northWest', () => {
    expect(getOppositeFacing('southEast')).toBe('northWest');
  });

  it('the opposite of south is north', () => {
    expect(getOppositeFacing('south')).toBe('north');
  });

  it('the opposite of southWest is northEast', () => {
    expect(getOppositeFacing('southWest')).toBe('northEast');
  });

  it('the opposite of west is east', () => {
    expect(getOppositeFacing('west')).toBe('east');
  });

  it('the opposite of northWest is southEast', () => {
    expect(getOppositeFacing('northWest')).toBe('southEast');
  });

  it('an unknown facing is rejected', () => {
    expect(() => getOppositeFacing('invalid' as UnitFacing)).toThrow(
      'Invalid facing: invalid',
    );
  });
});
