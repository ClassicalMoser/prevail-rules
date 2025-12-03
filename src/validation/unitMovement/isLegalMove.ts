import type { MoveUnitCommand } from "@commands";
import type { Board } from "@entities";
import { getLegalUnitMoves } from "@functions";

/**
 * Validates whether a unit move command is legal according to game rules.
 *
 * @param moveCommand - The move command to validate
 * @param boardState - The current board state
 * @returns True if the move is legal, false otherwise
 */
export function isLegalMove(
  moveCommand: MoveUnitCommand,
  boardState: Board,
): boolean {
  const { unit, from, to } = moveCommand;
  try {
    const legalMoves = getLegalUnitMoves(unit, boardState, from);
    // Set.has() uses reference equality, so we need to check by value
    return Array.from(legalMoves).some(
      (move) => move.coordinate === to.coordinate && move.facing === to.facing,
    );
  } catch {
    // If getLegalUnitMoves throws (invalid starting position, etc.), the move is not legal
    return false;
  }
}
