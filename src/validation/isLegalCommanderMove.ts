import type { MoveCommanderCommand } from "@commands";
import type { Board } from "@entities";
import { getBoardSpace, getSpacesWithinDistance } from "@functions";
import { COMMANDER_MOVE_DISTANCE } from "@sampleValues";

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
  try {
    const { player, from, to } = moveCommanderCommand;

    // Validate that the commander is at the starting position
    const fromSpace = getBoardSpace(boardState, from);
    // Check if the player's commander is actually at the starting position
    if (!fromSpace.commanders.has(player)) {
      return false;
    }

    // Validate that the destination is within the commander's move distance
    const spacesWithinDistance = getSpacesWithinDistance(
      boardState,
      from,
      COMMANDER_MOVE_DISTANCE,
    );

    return spacesWithinDistance.has(to);
  } catch {
    // Any error means the move is not legal.
    return false;
  }
}
