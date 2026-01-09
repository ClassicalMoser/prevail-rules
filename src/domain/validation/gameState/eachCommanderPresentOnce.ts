import type { Board, GameState, PlayerSide, ValidationResult } from '@entities';
import { getBoardCoordinates, getBoardSpace } from '@queries';

export function eachCommanderPresentOnce(
  gameState: GameState<Board>,
): ValidationResult {
  try {
    // We expect one commander per player
    const expectedCommanders: Set<PlayerSide> = new Set(['black', 'white']);
    // Track commanders that have been seen
    const seenCommanders: Set<PlayerSide> = new Set();

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
            result: false,
            errorReason: 'Duplicate commander on board',
          };
        }
        // Unexpected Commander
        if (!expectedCommanders.has(commander)) {
          return {
            result: false,
            errorReason: 'Unexpected commander on board',
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
          result: false,
          errorReason: 'Duplicate commander in lostCommanders',
        };
      }
      // Unexpected Commander
      if (!expectedCommanders.has(commander)) {
        return {
          result: false,
          errorReason: 'Unexpected commander in lostCommanders',
        };
      }
      // Add the commander to the seen commanders set
      seenCommanders.add(commander);
      // Remove the commander from the expected commanders set
      expectedCommanders.delete(commander);
    }

    // If expectedCommanders is empty, all expected commanders were found
    if (expectedCommanders.size !== 0) {
      return {
        result: false,
        errorReason: 'One or more commanders missing from game state',
      };
    }
    return {
      result: true,
    };
  } catch (error) {
    // Any error means validation fails - return false
    return {
      result: false,
      errorReason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
