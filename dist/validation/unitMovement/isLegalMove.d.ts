import type { MoveUnitCommand } from "src/commands/moveUnit.js";
import type { Board } from "src/entities/board/board.js";
/**
 * Validates whether a unit move command is legal according to game rules.
 *
 * @param moveCommand - The move command to validate
 * @param boardState - The current board state
 * @returns True if the move is legal, false otherwise
 */
export declare function isLegalMove(moveCommand: MoveUnitCommand, boardState: Board): boolean;
//# sourceMappingURL=isLegalMove.d.ts.map