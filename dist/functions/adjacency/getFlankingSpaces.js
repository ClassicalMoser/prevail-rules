import { getOrthogonalFacings } from "../facings/getOrthogonalFacings.js";
import { filterUndefinedSpaces } from "../filterUndefinedSpaces.js";
import { getForwardSpace } from "../getForwardSpace.js";
/**
 * Get the flanking spaces for a given coordinate and facing,
 * the spaces directly to the right and left of the facing
 * @param board - The board object
 * @param coordinate - The coordinate to get the flanking spaces for
 * @param facing - The facing to get the flanking spaces for
 * @returns A set of the flanking space coordinates (up to 2 spaces, directly to the right and left)
 */
export function getFlankingSpaces(board, coordinate, facing) {
    // Get orthogonal facings to get the flanking directions
    const orthogonalFacings = [...getOrthogonalFacings(facing)];
    // This error case should remain unreachable if prior validation is correct
    if (orthogonalFacings.length !== 2) {
        throw new Error(`Expected 2 orthogonal facings, but got ${orthogonalFacings.length}`);
    }
    // Set of coordinates and undefined values
    const flankingSpaces = new Set(orthogonalFacings.map((facing) => getForwardSpace(board, coordinate, facing)));
    // Filter out undefined values
    const validFlankingSpaces = filterUndefinedSpaces(flankingSpaces);
    // Return set of valid flanking spaces
    return validFlankingSpaces;
}
