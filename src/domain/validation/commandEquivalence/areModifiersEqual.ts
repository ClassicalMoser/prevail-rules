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
        result: false,
        errorReason: `Modifiers have different types: ${modifier1.type} vs ${modifier2.type}`,
      };
    }

    if (modifier1.value !== modifier2.value) {
      return {
        result: false,
        errorReason: `Modifiers have different values: ${modifier1.value} vs ${modifier2.value}`,
      };
    }

    return {
      result: true,
    };
  } catch (error) {
    return {
      result: false,
      errorReason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
