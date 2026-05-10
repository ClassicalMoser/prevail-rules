import type { Restrictions, ValidationResult } from '@entities';

/**
 * Compares two Restrictions objects for equality by comparing all properties.
 *
 * @param restrictions1 - First restrictions object
 * @param restrictions2 - Second restrictions object
 * @returns ValidationResult indicating if restrictions match, with error reason if not
 */
export function areRestrictionsEqual(
  restrictions1: Restrictions,
  restrictions2: Restrictions,
): ValidationResult {
  try {
    // Compare inspirationRangeRestriction
    if (
      restrictions1.inspirationRangeRestriction !==
      restrictions2.inspirationRangeRestriction
    ) {
      return {
        errorReason:
          'Restrictions have different inspirationRangeRestriction values',
        result: false,
      };
    }

    // Compare traitRestrictions arrays (order matters for arrays)
    if (
      restrictions1.traitRestrictions.length !==
      restrictions2.traitRestrictions.length
    ) {
      return {
        errorReason:
          'Restrictions have different traitRestrictions array lengths',
        result: false,
      };
    }
    for (let i = 0; i < restrictions1.traitRestrictions.length; i++) {
      if (
        restrictions1.traitRestrictions[i] !==
        restrictions2.traitRestrictions[i]
      ) {
        return {
          errorReason: `Restrictions have different traitRestrictions at index ${i}`,
          result: false,
        };
      }
    }

    // Compare unitRestrictions arrays (order matters for arrays)
    if (
      restrictions1.unitRestrictions.length !==
      restrictions2.unitRestrictions.length
    ) {
      return {
        errorReason:
          'Restrictions have different unitRestrictions array lengths',
        result: false,
      };
    }
    for (let i = 0; i < restrictions1.unitRestrictions.length; i++) {
      if (
        restrictions1.unitRestrictions[i] !== restrictions2.unitRestrictions[i]
      ) {
        return {
          errorReason: `Restrictions have different unitRestrictions at index ${i}`,
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
