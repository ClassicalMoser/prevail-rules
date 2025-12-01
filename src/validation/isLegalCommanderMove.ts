import type { MoveCommanderCommand } from "src/commands/moveCommander.js";
import type { Board } from "src/entities/board/board.js";
import { getSpacesWithinDistance } from "src/functions/boardSpace/areas/getSpacesWithinDistance.js";
import { getBoardSpace } from "src/functions/boardSpace/getBoardSpace.js";
import { COMMANDER_MOVE_DISTANCE } from "src/sampleValues/ruleValues.js";

/**
 * Validates whether a commander move command is legal.
 * Checks that the commander is at the starting position and the destination
 * is within COMMANDER_MOVE_DISTANCE.
 *
 * @param moveCommanderCommand - The commander move command to validate
 * @param boardState - The current board state
 * @returns True if the move is legal, false otherwise
 */
export function isLegalCommanderMove(
  moveCommanderCommand: MoveCommanderCommand,
  boardState: Board,
): boolean {
  const { player, from, to } = moveCommanderCommand;

  // Validate that the commander is at the starting position
  try {
    const fromSpace = getBoardSpace(boardState, from);
    // Check if the player's commander is actually at the starting position
    if (!fromSpace.commanders.has(player)) {
      return false;
    }
  } catch {
    // Invalid starting coordinate
    return false;
  }

  // Validate that the destination is within the commander's move distance
  const spacesWithinDistance = getSpacesWithinDistance(
    boardState,
    from,
    COMMANDER_MOVE_DISTANCE,
  );

  return spacesWithinDistance.has(to);
}
