import type { Modifier } from '@entities';
import { describe, expect, it } from 'vitest';
import { areModifiersArraysEqual } from './areModifiersArraysEqual';

describe('areModifiersArraysEqual', () => {
  it('should return true when both arrays are empty', () => {
    const modifiers1: Modifier[] = [];
    const modifiers2: Modifier[] = [];
    const { result } = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(result).toBe(true);
  });

  it('should return true when both arrays have identical modifiers in same order', () => {
    const modifiers1: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'speed', value: 2 },
    ];
    const modifiers2: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'speed', value: 2 },
    ];
    const { result } = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(result).toBe(true);
  });

  it('should return true when comparing array to itself', () => {
    const modifiers: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'defense', value: 2 },
    ];
    const { result } = areModifiersArraysEqual(modifiers, modifiers);
    expect(result).toBe(true);
  });

  it('should return true for different array references with same values', () => {
    const modifiers1: Modifier[] = [{ type: 'attack', value: 1 }];
    const modifiers2: Modifier[] = [{ type: 'attack', value: 1 }];
    const { result } = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(result).toBe(true);
  });

  it('should return false when arrays have different lengths', () => {
    const modifiers1: Modifier[] = [{ type: 'attack', value: 1 }];
    const modifiers2: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'speed', value: 2 },
    ];
    const validationResult = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(validationResult.result).toBe(false);
    if (!validationResult.result) {
      expect(validationResult.errorReason).toContain('different lengths');
    }
  });

  it('should return false when arrays differ at an index', () => {
    const modifiers1: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'speed', value: 2 },
    ];
    const modifiers2: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'speed', value: 3 },
    ];
    const validationResult = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(validationResult.result).toBe(false);
    if (!validationResult.result) {
      expect(validationResult.errorReason).toContain('differ at index');
    }
  });

  it('should return false when arrays have same modifiers in different order', () => {
    const modifiers1: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'speed', value: 2 },
    ];
    const modifiers2: Modifier[] = [
      { type: 'speed', value: 2 },
      { type: 'attack', value: 1 },
    ];
    const { result } = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(result).toBe(false);
  });

  it('should return false when first array is empty and second is not', () => {
    const modifiers1: Modifier[] = [];
    const modifiers2: Modifier[] = [{ type: 'attack', value: 1 }];
    const { result } = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(result).toBe(false);
  });

  it('should return false when second array is empty and first is not', () => {
    const modifiers1: Modifier[] = [{ type: 'attack', value: 1 }];
    const modifiers2: Modifier[] = [];
    const { result } = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(result).toBe(false);
  });

  it('should handle single element arrays correctly', () => {
    const modifiers1: Modifier[] = [{ type: 'defense', value: 2 }];
    const modifiers2: Modifier[] = [{ type: 'defense', value: 2 }];
    const { result } = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(result).toBe(true);
  });

  it('should handle arrays with multiple identical modifiers', () => {
    const modifiers1: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'attack', value: 1 },
      { type: 'attack', value: 1 },
    ];
    const modifiers2: Modifier[] = [
      { type: 'attack', value: 1 },
      { type: 'attack', value: 1 },
      { type: 'attack', value: 1 },
    ];
    const { result } = areModifiersArraysEqual(modifiers1, modifiers2);
    expect(result).toBe(true);
  });

  it('should return false when comparing arrays to undefined', () => {
    const modifiers: Modifier[] = [{ type: 'attack', value: 1 }];
    // Intentional type error to test the function
    const { result } = areModifiersArraysEqual(
      modifiers,
      undefined as unknown as Modifier[],
    );
    expect(result).toBe(false);
  });
});
