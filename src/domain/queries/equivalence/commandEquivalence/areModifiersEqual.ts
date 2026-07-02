import type { Modifier, ValidationResult } from '@entities';

/**
 * Compares two Modifier objects for equality by comparing all properties.
 *
 * @param modifier1 - First modifier object
 * @param modifier2 - Second modifier object
 * @returns ValidationResult indicating if modifiers match, with error reason if not
 */
export function areModifiersEqual(
  modifier1: Modifier,
  modifier2: Modifier,
): ValidationResult {
  try {
    if (modifier1.type !== modifier2.type) {
      return {
        errorReason: `Modifiers have different types: ${modifier1.type} vs ${modifier2.type}`,
        result: false,
      };
    }

    if (modifier1.value !== modifier2.value) {
      return {
        errorReason: `Modifiers have different values: ${modifier1.value} vs ${modifier2.value}`,
        result: false,
      };
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
