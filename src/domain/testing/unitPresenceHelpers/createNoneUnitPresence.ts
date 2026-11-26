import type { NoneUnitPresence } from '@entities';

/**
 * Creates a none unit presence for testing.
 *
 * @returns A none unit presence
 */
export function createNoneUnitPresence(): NoneUnitPresence {
  return { presenceType: 'none' };
}
