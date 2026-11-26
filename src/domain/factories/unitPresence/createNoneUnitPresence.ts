import type { NoneUnitPresence } from '@entities';

/**
 * What a space holds when no unit stands on it: every space of a new board,
 * and the space a lone unit leaves.
 *
 * @returns An empty space's presence
 */
export function createNoneUnitPresence(): NoneUnitPresence {
  // An empty space: no unit stands there (§2.2.1).
  const none: NoneUnitPresence = { presenceType: 'none' };

  // The presence, for a board space.
  return none;
}
