import type { Modifier, ValidationResult } from '@entities';
import { areModifiersEqual } from './areModifiersEqual';

/**
 * Compares two arrays of Modifiers for equality.
 * Arrays are compared element-by-element in order.
 *
 * @param modifiers1 - First modifiers array
 * @param modifiers2 - Second modifiers array
 * @returns ValidationResult indicating if modifier arrays match, with error reason if not
 */
export function areModifiersArraysEqual(
  modifiers1: Modifier[],
  modifiers2: Modifier[],
): ValidationResult {
  try {
    if (modifiers1.length !== modifiers2.length) {
      return {
        errorReason: `Modifier arrays have different lengths: ${modifiers1.length} vs ${modifiers2.length}`,
        result: false,
      };
    }

    for (let i = 0; i < modifiers1.length; i++) {
      const comparison = areModifiersEqual(modifiers1[i], modifiers2[i]);
      if (!comparison.result) {
        return {
          errorReason: `Modifier arrays differ at index ${i}: ${comparison.errorReason}`,
          result: false,
        };
      }
    }

    return {
      result: true,
    };
  } catch (error) {
    return {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
  }
}
