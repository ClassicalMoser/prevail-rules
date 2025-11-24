/**
 * Assert that two types are exactly the same.
 */
export type AssertExact<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : never
  : never;
