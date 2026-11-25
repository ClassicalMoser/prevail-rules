import type { UnitFacing } from '@entities';

/**
 * Get the adjacent facings for a given facing.
 * These are the two facings 45 degrees away from the given facing.
 * @param facing - The facing to get the adjacent facings for
 * @returns A set of the two adjacent facings (45 degrees away from the given facing)
 */
export const getAdjacentFacings = (facing: UnitFacing): Set<UnitFacing> => {
  // Each facing's two neighbours on the compass, 45° to either side: the
  // facings one turn left or right reaches (§5.2.1).
  switch (facing) {
    case 'north': {
      return new Set(['northWest', 'northEast']);
    }
    case 'northEast': {
      return new Set(['north', 'east']);
    }
    case 'east': {
      return new Set(['northEast', 'southEast']);
    }
    case 'southEast': {
      return new Set(['east', 'south']);
    }
    case 'south': {
      return new Set(['southEast', 'southWest']);
    }
    case 'southWest': {
      return new Set(['south', 'west']);
    }
    case 'west': {
      return new Set(['southWest', 'northWest']);
    }
    case 'northWest': {
      return new Set(['west', 'north']);
    }
    default: {
      // Only the eight facings exist; anything else is a malformed value.
      throw new Error(`Invalid facing: ${facing}`);
    }
  }
};
