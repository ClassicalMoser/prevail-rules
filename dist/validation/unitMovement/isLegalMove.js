import { getLegalUnitMoves } from "src/functions/getLegalUnitMoves.js";
/**
 * Validates whether a unit move command is legal according to game rules.
 *
 * @param moveCommand - The move command to validate
 * @param boardState - The current board state
 * @returns True if the move is legal, false otherwise
 */
export function isLegalMove(moveCommand, boardState) {
    const { unit, from, to } = moveCommand;
    const legalMoves = getLegalUnitMoves(unit, boardState, from);
    // Set.has() uses reference equality, so we need to check by value
    return Array.from(legalMoves).some((move) => move.coordinate === to.coordinate && move.facing === to.facing);
}
