/**
 * Narrows `T | undefined` to `T` by throwing when the value is strictly
 * `=== undefined`. Falsy-but-defined values (`null`, `0`, `""`, `false`) pass
 * through unchanged — this is "absent", not "falsy".
 *
 * Centralizes the "extract sub-shape, assert present, return" pattern that
 * recurs across navigation queries. Type-preserving: the input's `T` threads
 * through to the return type, including any generic correlation on the caller.
 *
 * @param value - The value to check
 * @param message - Error message used when `value === undefined`
 * @returns The same value, narrowed to `T`
 * @throws Error with the supplied message when `value === undefined`
 *
 * Typical usage example:
 * const phaseState = throwIfUndefined(
 *   state.currentRoundState.currentPhaseState,
 *   "No current phase state found",
 * );
 */
export function throwIfUndefined<T>(value: T | undefined, message: string): T {
  if (value === undefined) {
    throw new Error(message);
  }
  return value;
}
