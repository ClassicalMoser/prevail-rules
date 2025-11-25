import { getOppositeFacing } from "./facings/getOppositeFacing.js";
import { getForwardSpace } from "./getForwardSpace.js";
/**
 * Get the rearward space for a given coordinate and facing.
 * This is the space directly behind the given coordinate in the given facing direction.
 * @param coordinate - The coordinate to get the rearward space for
 * @param facing - The facing to get the rearward space for
 * @returns The coordinate of the rearward space
 * (directly behind the given coordinate in the given facing direction)
 * or undefined if the space is out of bounds
 */
export const getRearwardSpace = (coordinate, facing) => {
    // Get the opposite facing
    const oppositeFacing = getOppositeFacing(facing);
    // Get the rearward space
    const rearwardSpace = getForwardSpace(coordinate, oppositeFacing);
    // Return the rearward space
    return rearwardSpace;
};
