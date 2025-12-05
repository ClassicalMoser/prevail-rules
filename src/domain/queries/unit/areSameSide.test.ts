import { areSameSide } from '@queries';
import { createTestUnit } from '@testing';
import { describe, expect, it } from 'vitest';

describe('areSameSide', () => {
  it('should return true when both units belong to the same side', () => {
    const unit1 = createTestUnit('black', { attack: 3 });
    const unit2 = createTestUnit('black', { attack: 4 });
    expect(areSameSide(unit1, unit2)).toBe(true);
  });

  it('should return false when units belong to different sides', () => {
    const unit1 = createTestUnit('black', { attack: 3 });
    const unit2 = createTestUnit('white', { attack: 3 });
    expect(areSameSide(unit1, unit2)).toBe(false);
  });

  it('should return true for white units on the same side', () => {
    const unit1 = createTestUnit('white', { attack: 3 });
    const unit2 = createTestUnit('white', { attack: 4 });
    expect(areSameSide(unit1, unit2)).toBe(true);
  });

  it('should return true when comparing a unit to itself', () => {
    const unit = createTestUnit('black', { attack: 3 });
    expect(areSameSide(unit, unit)).toBe(true);
  });
});
