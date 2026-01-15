import { getUnitByStatValue } from '@testing';
import { describe, expect, it } from 'vitest';
import { createUnitInstance } from './createUnitInstance';

describe('createUnitInstance', () => {
  it('should create a unit instance with the specified properties', () => {
    const unitType = getUnitByStatValue('attack', 3);
    if (!unitType) {
      throw new Error('No unit found with attack value 3');
    }

    const unit = createUnitInstance('black', unitType, 1);

    expect(unit.playerSide).toBe('black');
    expect(unit.unitType).toBe(unitType);
    expect(unit.instanceNumber).toBe(1);
  });
});
