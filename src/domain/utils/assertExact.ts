/**
 * Helper type used to assert that two types are exactly the same.
 * @param A - The first type to compare
 * @param B - The second type to compare
 * @assertion - True if the two types are exactly the same, false otherwise
 *
 * Typical usage example:
 * const _aMatchesBExactly: AssertExact<TypeA, TypeB> = true;
 */
export type AssertExact<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : never
  : never;
