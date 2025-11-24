import type { UnitFacing } from "../entities/unit/unitFacing.js";

export const getAdjacentFacings = (facing: UnitFacing): UnitFacing[] => {
  const parseAdjacentFacings = (facing: UnitFacing): UnitFacing[] => {
    switch (facing) {
      case "north":
        return ["northWest", "northEast"];
      case "northEast":
        return ["north", "east"];
      case "east":
        return ["northEast", "southEast"];
      case "southEast":
        return ["east", "south"];
      case "south":
        return ["southEast", "southWest"];
      case "southWest":
        return ["south", "west"];
      case "west":
        return ["southWest", "northWest"];
      case "northWest":
        return ["west", "north"];
      default:
        throw new Error(`Invalid facing: ${facing}`);
    }
  };
  const adjacentFacings = parseAdjacentFacings(facing);
  if (adjacentFacings.length !== 2) {
    throw new Error(`Invalid facing: ${facing}`);
  }
  return adjacentFacings;
};
