import { createTestUnit } from '@testing';
import { describe, expect, it } from 'vitest';
import { isFriendlyUnit } from './isFriendlyUnit';

describe('isFriendlyUnit', () => {
  it('should return true when unit belongs to the player side', () => {
    const unit = createTestUnit('black', { attack: 3 });
    expect(isFriendlyUnit(unit, 'black')).toBe(true);
  });

  it('should return false when unit belongs to a different player side', () => {
    const unit = createTestUnit('black', { attack: 3 });
    expect(isFriendlyUnit(unit, 'white')).toBe(false);
  });

  it('should return true for white units when checking white side', () => {
    const unit = createTestUnit('white', { attack: 3 });
    expect(isFriendlyUnit(unit, 'white')).toBe(true);
  });

  it('should return false for white units when checking black side', () => {
    const unit = createTestUnit('white', { attack: 3 });
    expect(isFriendlyUnit(unit, 'black')).toBe(false);
  });
});
