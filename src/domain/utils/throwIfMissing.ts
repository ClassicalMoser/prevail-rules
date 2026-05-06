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

/**
 * Narrows `T | null | undefined` to `T` by throwing when the value is falsy.
 * Use when "absent" includes both `null` and `undefined` (e.g., third-party
 * APIs, `Array.prototype.find` results). Note: `0`, `""`, and `false` will
 * also throw — prefer {@link throwIfUndefined} when only `undefined` should
 * trigger the throw.
 *
 * @param value - The value to check
 * @param message - Error message used when `value` is falsy
 * @returns The same value, narrowed to `T`
 * @throws Error with the supplied message when `value` is falsy
 */
export function throwIfFalsy<T>(value: T | null | undefined, message: string): T {
  if (!value) {
    throw new Error(message);
  }
  return value;
}
