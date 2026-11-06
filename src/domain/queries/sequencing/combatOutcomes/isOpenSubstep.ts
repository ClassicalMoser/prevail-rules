/**
 * An attack outcome is open when its substep has been written.
 * `'pending'` has not been written. `'miss'` means that outcome did not happen.
 */
export function isOpenSubstep<T>(value: T | 'pending' | 'miss'): value is T {
  // The substep object is the only value there is to read.
  return value !== 'pending' && value !== 'miss';
}
