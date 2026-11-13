/**
 * Narrows `T | undefined` to `T` by throwing when the value is strictly
 * `=== undefined`. Falsy-but-defined values (`null`, `0`, `""`, `false`) pass
 * through unchanged — this is "absent", not "falsy".
 *
 * Type-preserving: the input's `T` threads through to the return type,
 * including any generic correlation on the caller.
 *
 * @param value - The value to check
 * @param message - Error message used when `value === undefined`
 * @returns The same value, narrowed to `T`
 * @throws Error with the supplied message when `value === undefined`
 *
 * Typical usage example:
 * const value = throwIfUndefined(maybeValue, "No value found");
 */
export function throwIfUndefined<T>(value: T | undefined, message: string): T {
  // Only missing counts — a defined falsy value is still the value asked for.
  if (value === undefined) {
    throw new Error(message);
  }

  // Defined, so it is the value asked for.
  return value;
}
