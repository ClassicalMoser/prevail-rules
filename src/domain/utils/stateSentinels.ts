/**
 * Guards for a state field that holds either its value or a sentinel string.
 * Each function compares against the strings in its own signature.
 */

// TODO(composition): these compare strings, not slots. The same word names
// unrelated facts (`commitmentType: 'pending'`, `restrictionType: 'none'`,
// `presenceType: 'none'`). A combat-outcome slot also uses `'bypassed'`, which
// `isResolved` / `throwIfPending` treat as a filled value. See AUDIT.md `utils`.

/** Narrows `T | 'pending'` to `'pending'`. */
export function isPending<T>(value: T | 'pending'): value is 'pending' {
  // Equality with that string alone — which field used it is the caller's.
  return value === 'pending';
}

/** Narrows `T | 'pending'` to `T`. */
export function isResolved<T>(value: T | 'pending'): value is T {
  // Anything but the waiting string counts as filled, including other sentinels.
  return value !== 'pending';
}

/** Narrows `T | 'bypassed'` to `'bypassed'`. */
export function isBypassed<T>(value: T | 'bypassed'): value is 'bypassed' {
  // A combat outcome that did not happen is stored as this string, not as absent.
  return value === 'bypassed';
}

/** Narrows `T | 'bypassed'` to `T`. */
export function isApplied<T>(value: T | 'bypassed'): value is T {
  // The outcome object is present only when the attack did not skip that result.
  return value !== 'bypassed';
}

/** Narrows `T | 'none'` to `'none'`. */
export function isNone<T>(value: T | 'none'): value is 'none' {
  // Equality with that string alone — phase absence, and other `'none'` facts.
  return value === 'none';
}

/** Narrows `T | 'none'` to `T`. */
export function isActive<T>(value: T | 'none'): value is T {
  // Anything but the absent string counts as present, including other sentinels.
  return value !== 'none';
}

/**
 * Narrows `T | 'pending'` to `T` by throwing when the value is `'pending'`.
 */
export function throwIfPending<T>(value: T | 'pending', message: string): T {
  // A caller that needs the filled value stops while the slot is still waiting.
  if (isPending(value)) {
    throw new Error(message);
  }
  return value;
}

/**
 * Narrows `T | 'bypassed'` to `T` by throwing when the value is `'bypassed'`.
 */
export function throwIfBypassed<T>(value: T | 'bypassed', message: string): T {
  // A caller that needs the outcome object stops when that result was skipped.
  if (isBypassed(value)) {
    throw new Error(message);
  }
  return value;
}

/**
 * Narrows `T | 'none'` to `T` by throwing when the value is `'none'`.
 */
export function throwIfNone<T>(value: T | 'none', message: string): T {
  // A caller that needs the present value stops while the slot is still absent.
  if (isNone(value)) {
    throw new Error(message);
  }
  return value;
}
