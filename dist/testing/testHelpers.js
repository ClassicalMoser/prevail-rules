/**
 * Checks if a coordinate (and optionally facing) is present in a set of legal moves.
 * This is a test utility for validating move generation functions.
 *
 * @param legalMoves - Set of legal moves to check against
 * @param coordinate - The coordinate to check for
 * @param facing - Optional facing to match (if not provided, matches any facing)
 * @returns True if the coordinate (and facing if specified) is in the legal moves
 */
export function hasMove(legalMoves, coordinate, facing) {
    return Array.from(legalMoves).some((move) => move.coordinate === coordinate &&
        (facing === undefined || move.facing === facing));
}
