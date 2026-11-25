import type { UnitFacing } from '@entities';

/**
 * Get the left-facing direction for a given facing.
 * This rotates the facing 90 degrees counterclockwise.
 * @param facing - The facing to get the left-facing direction for
 * @returns The left-facing direction (90 degrees counterclockwise from the given facing)
 */
export function getLeftFacing(facing: UnitFacing): UnitFacing {
  // A quarter turn counterclockwise: the way a unit's left flank lies.
  switch (facing) {
    case 'north': {
      return 'west';
    }
    case 'northEast': {
      return 'northWest';
    }
    case 'east': {
      return 'north';
    }
    case 'southEast': {
      return 'northEast';
    }
    case 'south': {
      return 'east';
    }
    case 'southWest': {
      return 'southEast';
    }
    case 'west': {
      return 'south';
    }
    case 'northWest': {
      return 'southWest';
    }
    default: {
      // Only the eight facings exist; anything else is a malformed value.
      throw new Error(`Invalid facing: ${facing}`);
    }
  }
}
