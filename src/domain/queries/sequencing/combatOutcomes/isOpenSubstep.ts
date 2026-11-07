import { isApplied, isResolved } from '@utils';

/**
 * An attack outcome is open when its substep has been written.
 * `'pending'` has not been written. `'bypassed'` means that outcome did not happen.
 *
 * A three-sentinel slot is the two guards one after the other: `isResolved`
 * rejects the slot that has not been written, `isApplied` rejects the outcome
 * the rules skipped. Neither alone answers this, which is why a slot that can
 * be `'bypassed'` is read here rather than by a `'pending'` check on its own.
 */
export function isOpenSubstep<T>(
  value: T | 'pending' | 'bypassed',
): value is T {
  // The substep object is the only value there is to read.
  return isResolved(value) && isApplied(value);
}
