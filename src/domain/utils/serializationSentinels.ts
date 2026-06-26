/**
 * Type guards and throw helpers for JSON-serializable sentinel values that
 * replace `undefined` in game state (which does not survive JSON round-trips).
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
  if (value === 'pending') {
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
