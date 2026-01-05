import type { Board, GameState, PlayerSide } from '@entities';
import { getBoardCoordinates, getBoardSpace } from '@queries';

export function eachCommanderPresentOnce(gameState: GameState<Board>): boolean {
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
          return false;
        }
        // Unexpected Commander
        if (!expectedCommanders.has(commander)) {
          return false;
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
        return false;
      }
      // Unexpected Commander
      if (!expectedCommanders.has(commander)) {
        return false;
      }
      // Add the commander to the seen commanders set
      seenCommanders.add(commander);
      // Remove the commander from the expected commanders set
      expectedCommanders.delete(commander);
    }

    // If expectedCommanders is empty, all expected commanders were found
    return expectedCommanders.size === 0;
  } catch {
    // Any error means validation fails - return false
    return false;
  }
}
