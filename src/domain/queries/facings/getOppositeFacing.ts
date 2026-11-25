import type { UnitFacing } from '@entities';

/**
 * Get the opposite facing of a given facing.
 * This is the facing directly opposite the given facing.
 * @param facing - The facing to get the opposite facing for
 * @returns The opposite facing (180 degrees away from the given facing)
 */
export function getOppositeFacing(facing: UnitFacing): UnitFacing {
  // Half way round the compass: the way a unit faces after an about-turn,
  // and the way a squared-up enemy faces it (§6.2.3).
  switch (facing) {
    case 'north': {
      return 'south';
    }
    case 'northEast': {
      return 'southWest';
    }
    case 'east': {
      return 'west';
    }
    case 'southEast': {
      return 'northWest';
    }
    case 'south': {
      return 'north';
    }
    case 'southWest': {
      return 'northEast';
    }
    case 'west': {
      return 'east';
    }
    case 'northWest': {
      return 'southEast';
    }
    default: {
      // Only the eight facings exist; anything else is a malformed value.
      throw new Error(`Invalid facing: ${facing}`);
    }
  }
}
