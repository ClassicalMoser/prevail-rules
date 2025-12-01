import type { MoveUnitCommand } from "src/commands/moveUnit.js";
import type { Board } from "src/entities/board/board.js";
import { getLegalUnitMoves } from "src/functions/getLegalUnitMoves.js";

export function isLegalMove(
  moveCommand: MoveUnitCommand,
  boardState: Board
): boolean {
  const { unit, from, to } = moveCommand;
  const legalMoves = getLegalUnitMoves(unit, boardState, from);
  // Set.has() uses reference equality, so we need to check by value
  return Array.from(legalMoves).some(
    (move) => move.coordinate === to.coordinate && move.facing === to.facing
  );
}
