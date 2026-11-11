import type { FailValidationResult } from './validationResult';

/**
 * The refusal for a fault found while validating: something threw where the
 * rules had no answer to give. The fault's own message is kept, since it
 * names the cause where it happened, and is placed under what was being done
 * when it surfaced.
 *
 * A validator calls this once, at its outermost boundary. Beneath it the
 * fault is left to fall through, so no layer in between hides or rewords it.
 *
 * @param fault - Whatever was thrown
 * @param whileDoing - What was being validated, as a gerund phrase such as `validating player choice`
 * @returns A failed result naming the activity and the cause
 */
export function failFromFault(
  fault: unknown,
  whileDoing: string,
): FailValidationResult {
  const errorReason =
    fault instanceof Error
      ? `Error ${whileDoing}: ${fault.message}`
      : `Unknown error ${whileDoing}`;
  const failure: FailValidationResult = { errorReason, result: false };
  return failure;
}
