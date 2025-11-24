import type { UnitFacing } from "../entities/unit/unitFacing.js";

export const getAdjacentFacings = (facing: UnitFacing): Set<UnitFacing> => {
  const parseAdjacentFacings = (facing: UnitFacing): Set<UnitFacing> => {
    switch (facing) {
      case "north":
        return new Set(["northWest", "northEast"]);
      case "northEast":
        return new Set(["north", "east"]);
      case "east":
        return new Set(["northEast", "southEast"]);
      case "southEast":
        return new Set(["east", "south"]);
      case "south":
        return new Set(["southEast", "southWest"]);
      case "southWest":
        return new Set(["south", "west"]);
      case "west":
        return new Set(["southWest", "northWest"]);
      case "northWest":
        return new Set(["west", "north"]);
      default:
        throw new Error(`Invalid facing: ${facing}`);
    }
  };
  const adjacentFacings = parseAdjacentFacings(facing);
  if (adjacentFacings.size !== 2) {
    throw new Error(`Invalid facing: ${facing}`);
  }
  return adjacentFacings;
};
