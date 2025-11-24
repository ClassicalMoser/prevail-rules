import type { UnitFacing } from "../entities/unit/unitFacing.js";

export const getOrthogonalFacings = (facing: UnitFacing): Set<UnitFacing> => {
  const parseOrthogonalFacings = (facing: UnitFacing): Set<UnitFacing> => {
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
