import type { NoneUnitPresence } from '@entities';

/**
 * Creates a none unit presence for testing.
 *
 * @returns A none unit presence
 *
 * TODO(composition): this builds a value from raw inputs, which is a factory's
 * job, and production builds the same presence by hand in its own writers
 * (`addUnitToBoard`, `removeUnitFromBoard`, `addEngagingUnitToBoard`,
 * `createEmptyBoard`). To settle: move the presence builders to `@factories`
 * and have those writers and this layer call them.
 */
export function createNoneUnitPresence(): NoneUnitPresence {
  // An empty space: no unit stands there (§2.2.1).
  const none: NoneUnitPresence = { presenceType: 'none' };

  // The presence, for a board space.
  return none;
}
