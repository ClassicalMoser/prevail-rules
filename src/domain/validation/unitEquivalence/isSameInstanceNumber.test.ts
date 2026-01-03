import type { UnitInstance } from '@entities';
import { createTestUnit } from '@testing';
import { describe, expect, it } from 'vitest';
import { isSameInstanceNumber } from './isSameInstanceNumber';

describe('isSameInstanceNumber', () => {
  it('should return true when both units have the same instance number', () => {
    const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const unit2 = createTestUnit('black', { attack: 4, instanceNumber: 1 });
    expect(isSameInstanceNumber(unit1, unit2)).toBe(true);
  });

  it('should return false when units have different instance numbers', () => {
    const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 2 });
    expect(isSameInstanceNumber(unit1, unit2)).toBe(false);
  });

  it('should return true when comparing a unit to itself', () => {
    const unit = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    expect(isSameInstanceNumber(unit, unit)).toBe(true);
  });

  it('should return true for different sides with same instance number', () => {
    const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const unit2 = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    expect(isSameInstanceNumber(unit1, unit2)).toBe(true);
  });

  it('should return false for different instance numbers even with same type', () => {
    const unit1 = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const unit2 = createTestUnit('black', { attack: 3, instanceNumber: 3 });
    expect(isSameInstanceNumber(unit1, unit2)).toBe(false);
  });

  it('should return false when comparing a unit to undefined', () => {
    const unit = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    // Intentional type error to test the function
    expect(
      isSameInstanceNumber(unit, undefined as unknown as UnitInstance),
    ).toBe(false);
  });
});
