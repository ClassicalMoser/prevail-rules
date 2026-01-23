import type { Modifier } from '@entities';
import { describe, expect, it } from 'vitest';
import { areModifiersEqual } from './areModifiersEqual';

describe('areModifiersEqual', () => {
  it('should return true when both modifiers have the same type and value', () => {
    const modifier1: Modifier = { type: 'attack', value: 1 };
    const modifier2: Modifier = { type: 'attack', value: 1 };
    const { result } = areModifiersEqual(modifier1, modifier2);
    expect(result).toBe(true);
  });

  it('should return false when modifiers have different types', () => {
    const modifier1: Modifier = { type: 'attack', value: 1 };
    const modifier2: Modifier = { type: 'speed', value: 1 };
    const validationResult = areModifiersEqual(modifier1, modifier2);
    expect(validationResult.result).toBe(false);
    if (!validationResult.result) {
      expect(validationResult.errorReason).toContain('different types');
    }
  });

  it('should return false when modifiers have different values', () => {
    const modifier1: Modifier = { type: 'attack', value: 1 };
    const modifier2: Modifier = { type: 'attack', value: 2 };
    const validationResult = areModifiersEqual(modifier1, modifier2);
    expect(validationResult.result).toBe(false);
    if (!validationResult.result) {
      expect(validationResult.errorReason).toContain('different values');
    }
  });

  it('should return true when comparing a modifier to itself', () => {
    const modifier: Modifier = { type: 'attack', value: 1 };
    const { result } = areModifiersEqual(modifier, modifier);
    expect(result).toBe(true);
  });

  it('should return true for different object references with same values', () => {
    const modifier1: Modifier = { type: 'defense', value: 2 };
    const modifier2: Modifier = { type: 'defense', value: 2 };
    const { result } = areModifiersEqual(modifier1, modifier2);
    expect(result).toBe(true);
  });

  it('should return false when comparing a modifier to undefined', () => {
    const modifier: Modifier = { type: 'attack', value: 1 };
    // Intentional type error to test the function
    const { result } = areModifiersEqual(
      modifier,
      undefined as unknown as Modifier,
    );
    expect(result).toBe(false);
  });

  it('should handle negative values correctly', () => {
    const modifier1: Modifier = { type: 'attack', value: -1 };
    const modifier2: Modifier = { type: 'attack', value: -1 };
    const { result } = areModifiersEqual(modifier1, modifier2);
    expect(result).toBe(true);
  });

  it('should handle zero values correctly', () => {
    const modifier1: Modifier = { type: 'speed', value: 0 };
    const modifier2: Modifier = { type: 'speed', value: 0 };
    const { result } = areModifiersEqual(modifier1, modifier2);
    expect(result).toBe(true);
  });
});
