import type { UnitFacing } from "../../entities/unit/unitFacing.js";

/**
 * Get the left-facing direction for a given facing.
 * This rotates the facing 90 degrees counterclockwise.
 * @param facing - The facing to get the left-facing direction for
 * @returns The left-facing direction (90 degrees counterclockwise from the given facing)
 */
export function getLeftFacing(facing: UnitFacing): UnitFacing {
  switch (facing) {
    case "north":
      return "west";
    case "northEast":
      return "northWest";
    case "east":
      return "north";
    case "southEast":
      return "northEast";
    case "south":
      return "east";
    case "southWest":
      return "southEast";
    case "west":
      return "south";
    case "northWest":
      return "southWest";
    default:
      throw new Error(`Invalid facing: ${facing}`);
  }
}

