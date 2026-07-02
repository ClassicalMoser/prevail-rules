import type { PlayerSide, ValidationResult } from '@entities';
import type { GameState } from '@game';
import { getBoardCoordinates, getBoardSpace } from '@queries';
export function eachCommanderPresentOnce(
  gameState: GameState,
): ValidationResult {
  try {
    // We expect one commander per player
    const expectedCommanders = new Set<PlayerSide>(['black', 'white']);
    // Track commanders that have been seen
    const seenCommanders = new Set<PlayerSide>();

    // Find the board and its coordinates
    const board = gameState.boardState;
    const boardCoordinates = getBoardCoordinates(board);
    // Iterate over each space on the board
    for (const coordinate of boardCoordinates) {
      const space = getBoardSpace(board, coordinate);
      // Iterate over each commander in the space
      for (const commander of space.commanders) {
        // Duplicate Commander
        if (seenCommanders.has(commander)) {
          return {
            errorReason: 'Duplicate commander on board',
            result: false,
          };
        }
        // Unexpected Commander
        if (!expectedCommanders.has(commander)) {
          return {
            errorReason: 'Unexpected commander on board',
            result: false,
          };
        }
        // Add the commander to the seen commanders set
        seenCommanders.add(commander);
        // Remove the commander from the expected commanders set
        expectedCommanders.delete(commander);
      }
    }

    // Iterate over each lost commander
    for (const commander of gameState.lostCommanders) {
      // Duplicate Commander
      if (seenCommanders.has(commander)) {
        return {
          errorReason: 'Duplicate commander in lostCommanders',
          result: false,
        };
      }
      // Unexpected Commander
      if (!expectedCommanders.has(commander)) {
        return {
          errorReason: 'Unexpected commander in lostCommanders',
          result: false,
        };
      }
      // Add the commander to the seen commanders set
      seenCommanders.add(commander);
      // Remove the commander from the expected commanders set
      expectedCommanders.delete(commander);
    }

    // If expectedCommanders is empty, all expected commanders were found
    if (expectedCommanders.size > 0) {
      return {
        errorReason: 'One or more commanders missing from game state',
        result: false,
      };
    }
    return {
      result: true,
    };
  } catch (error) {
    // Any error means validation fails - return false
    return {
      errorReason: error instanceof Error ? error.message : 'Unknown error',
      result: false,
    };
  }
}
