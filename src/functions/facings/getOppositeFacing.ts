import type { UnitFacing } from "@entities";

/**
 * Get the opposite facing of a given facing.
 * This is the facing directly opposite the given facing.
 * @param facing - The facing to get the opposite facing for
 * @returns The opposite facing (180 degrees away from the given facing)
 */
export function getOppositeFacing(facing: UnitFacing): UnitFacing {
  switch (facing) {
    case "north":
      return "south";
    case "northEast":
      return "southWest";
    case "east":
      return "west";
    case "southEast":
      return "northWest";
    case "south":
      return "north";
    case "southWest":
      return "northEast";
    case "west":
      return "east";
    case "northWest":
      return "southEast";
    default:
      throw new Error(`Invalid facing: ${facing}`);
  }
}
