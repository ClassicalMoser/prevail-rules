import type { UnitFacing } from '@entities';

/**
 * Get the right-facing direction for a given facing.
 * This rotates the facing 90 degrees clockwise.
 * @param facing - The facing to get the right-facing direction for
 * @returns The right-facing direction (90 degrees clockwise from the given facing)
 */
export function getRightFacing(facing: UnitFacing): UnitFacing {
  // A quarter turn clockwise: the way a unit's right flank lies.
  switch (facing) {
    case 'north': {
      return 'east';
    }
    case 'northEast': {
      return 'southEast';
    }
    case 'east': {
      return 'south';
    }
    case 'southEast': {
      return 'southWest';
    }
    case 'south': {
      return 'west';
    }
    case 'southWest': {
      return 'northWest';
    }
    case 'west': {
      return 'north';
    }
    case 'northWest': {
      return 'northEast';
    }
    default: {
      // Only the eight facings exist; anything else is a malformed value.
      throw new Error(`Invalid facing: ${facing}`);
    }
  }
}
