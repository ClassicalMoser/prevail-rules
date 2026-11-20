import { getUnitByStatValue } from '@testing';
import { createUnitInstance } from '@factories';

import { getUnitIdentityKey } from './getUnitIdentityKey';

/**
 * A unit's key tells it apart from every other unit exactly as
 * isSameUnitInstance does: by side, unit type and instance number.
 */
describe('getUnitIdentityKey function', () => {
  // Two unit types from the stand-in catalog; any two distinct types will do.
  const firstType = getUnitByStatValue('flexibility', 1);
  const secondType = getUnitByStatValue('flexibility', 2);

  it('gives two copies of the same unit the same key', () => {
    // The same side, type and instance, built twice.
    const unit = createUnitInstance('black', firstType, 1);
    const copy = createUnitInstance('black', firstType, 1);
    expect(getUnitIdentityKey(copy)).toBe(getUnitIdentityKey(unit));
  });

  it('tells apart units that differ in side, type or instance number', () => {
    // Each differs from the first unit in one part only.
    const unit = createUnitInstance('black', firstType, 1);
    const otherSide = createUnitInstance('white', firstType, 1);
    const otherType = createUnitInstance('black', secondType, 1);
    const otherInstance = createUnitInstance('black', firstType, 2);
    const key = getUnitIdentityKey(unit);
    expect(getUnitIdentityKey(otherSide)).not.toBe(key);
    expect(getUnitIdentityKey(otherType)).not.toBe(key);
    expect(getUnitIdentityKey(otherInstance)).not.toBe(key);
  });
});
