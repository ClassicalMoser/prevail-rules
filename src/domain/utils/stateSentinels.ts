/**
 * Guards for a state field that holds either its value or a sentinel string.
 * Each function compares against the strings in its own signature.
 */

/** Narrows `T | 'pending'` to `'pending'`. */
export function isPending<T>(value: T | 'pending'): value is 'pending' {
  return value === 'pending';
}

/** Narrows `T | 'pending'` to `T`. */
export function isResolved<T>(value: T | 'pending'): value is T {
  return value !== 'pending';
}

/** Narrows `T | 'none'` to `'none'`. */
export function isNone<T>(value: T | 'none'): value is 'none' {
  return value === 'none';
}

/** Narrows `T | 'none'` to `T`. */
export function isActive<T>(value: T | 'none'): value is T {
  return value !== 'none';
}

/**
 * Narrows `T | 'pending'` to `T` by throwing when the value is `'pending'`.
 */
export function throwIfPending<T>(value: T | 'pending', message: string): T {
  if (isPending(value)) {
    throw new Error(message);
  }
  return value;
}

/**
 * Narrows `T | 'none'` to `T` by throwing when the value is `'none'`.
 */
export function throwIfNone<T>(value: T | 'none', message: string): T {
  if (value === 'none') {
    throw new Error(message);
  }
  return value;
}
