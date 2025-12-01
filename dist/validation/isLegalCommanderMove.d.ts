import type { MoveCommanderCommand } from "src/commands/moveCommander.js";
import type { Board } from "src/entities/board/board.js";
/**
 * Validates whether a commander move command is legal.
 * Checks that the commander is at the starting position and the destination
 * is within COMMANDER_MOVE_DISTANCE.
 *
 * @param moveCommanderCommand - The commander move command to validate
 * @param boardState - The current board state
 * @returns True if the move is legal, false otherwise
 */
export declare function isLegalCommanderMove(moveCommanderCommand: MoveCommanderCommand, boardState: Board): boolean;
//# sourceMappingURL=isLegalCommanderMove.d.ts.map