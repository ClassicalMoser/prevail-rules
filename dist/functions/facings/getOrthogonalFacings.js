/**
 * Get the orthogonal facings for a given facing.
 * These are the two facings perpendicular to the given facing.
 * @param facing - The facing to get the orthogonal facings for
 * @returns A set of the two orthogonal facings (90 degrees away from the given facing)
 */
export const getOrthogonalFacings = (facing) => {
  const parseOrthogonalFacings = (facing) => {
    switch (facing) {
      case "north":
        return new Set(["west", "east"]);
      case "northEast":
        return new Set(["northWest", "southEast"]);
      case "east":
        return new Set(["north", "south"]);
      case "southEast":
        return new Set(["northEast", "southWest"]);
      case "south":
        return new Set(["east", "west"]);
      case "southWest":
        return new Set(["southEast", "northWest"]);
      case "west":
        return new Set(["south", "north"]);
      case "northWest":
        return new Set(["southWest", "northEast"]);
      default:
        throw new Error(`Invalid facing: ${facing}`);
    }
  };
  const orthogonalFacings = parseOrthogonalFacings(facing);
  // This error case should remain unreachable if prior validation is correct
  if (orthogonalFacings.size !== 2) {
    throw new Error(`Invalid facing: ${facing}`);
  }
  return orthogonalFacings;
};
