import type { UnitFacing } from "../entities/unit/unitFacing.js";

export const getOrthogonalFacings = (facing: UnitFacing): UnitFacing[] => {
  const parseOrthogonalFacings = (facing: UnitFacing): UnitFacing[] => {
    switch (facing) {
      case "north":
        return ["west", "east"];
      case "northEast":
        return ["northWest", "southEast"];
      case "east":
        return ["north", "south"];
      case "southEast":
        return ["northEast", "southWest"];
      case "south":
        return ["east", "west"];
      case "southWest":
        return ["southEast", "northWest"];
      case "west":
        return ["south", "north"];
      case "northWest":
        return ["southWest", "northEast"];
      default:
        throw new Error(`Invalid facing: ${facing}`);
    }
  };
  const orthogonalFacings = parseOrthogonalFacings(facing);
  if (orthogonalFacings.length !== 2) {
    throw new Error(`Invalid facing: ${facing}`);
  }
  return orthogonalFacings;
};
