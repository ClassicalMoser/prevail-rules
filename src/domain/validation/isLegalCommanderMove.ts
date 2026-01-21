import type { Board, ValidationResult } from '@entities';
import type { MoveCommanderEvent } from '@events';
import { getBoardSpace, getSpacesWithinDistance } from '@queries';
import { COMMANDER_MOVE_DISTANCE } from '@ruleValues';

/**
 * Validates whether a commander move event is legal.
 * Checks that the commander is at the starting position and the destination
 * is within COMMANDER_MOVE_DISTANCE.
 *
 * @param moveCommanderEvent - The commander move event to validate
 * @param boardState - The current board state
 * @returns ValidationResult indicating if the move is legal
 */
export function isLegalCommanderMove<TBoard extends Board>(
  moveCommanderEvent: MoveCommanderEvent<TBoard>,
  boardState: Board,
): ValidationResult {
  try {
    const { player, from, to } = moveCommanderEvent;

    // Validate that the commander is at the starting position
    const fromSpace = getBoardSpace(boardState, from);
    // Check if the player's commander is actually at the starting position
    if (!fromSpace.commanders.has(player)) {
      return {
        result: false,
        errorReason: 'Commander is not at the starting position',
      };
    }

    // Validate that the destination is within the commander's move distance
    const spacesWithinDistance = getSpacesWithinDistance(
      boardState,
      from,
      COMMANDER_MOVE_DISTANCE,
    );

    const isWithinDistance = spacesWithinDistance.has(to);
    if (!isWithinDistance) {
      return {
        result: false,
        errorReason: "Destination is beyond the commander's move distance",
      };
    }
    return {
      result: true,
    };
  } catch (error) {
    // Any error means the move is not legal.
    return {
      result: false,
      errorReason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
