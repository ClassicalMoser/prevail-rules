import type { SingleUnitPresence, UnitFacing, UnitInstance } from '@entities';

/**
 * Creates a single unit presence for testing.
 *
 * @param unit - The unit in the space
 * @param facing - The facing direction of the unit
 * @returns A single unit presence
 *
 * TODO(composition): this builds a value from raw inputs, which is a factory's
 * job, and production builds the same presence by hand in its own writers
 * (`addUnitToBoard`, `removeUnitFromBoard`, `addEngagingUnitToBoard`,
 * `createEmptyBoard`). To settle: move the presence builders to `@factories`
 * and have those writers and this layer call them.
 */
export function createSingleUnitPresence(
  unit: UnitInstance,
  facing: UnitFacing,
): SingleUnitPresence {
  // One unit alone on the space, facing one of the eight ways (§2.3.1).
  const single: SingleUnitPresence = {
    facing,
    presenceType: 'single',
    unit,
  };

  // The presence, for a board space.
  return single;
}
