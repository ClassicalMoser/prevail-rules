import type { Board, BoardCoordinate, GameState, PlayerSide } from '@entities';
import { getBoardSpace } from '@queries/boardSpace';

export function exploreCommanderMoves<TBoard extends Board>(
  playerSide: PlayerSide,
  gameState: GameState<TBoard>,
  startingPosition: BoardCoordinate<TBoard>,
): Set<BoardCoordinate<TBoard>> {
  // Get the board state
  const board = gameState.boardState;
  // Get the space at the starting position
  const space = getBoardSpace(board, startingPosition);
  // Get the commander
  const containsCommander = space.commanders.has(playerSide);
  if (!containsCommander) {
    throw new Error('Starting position does not contain commander');
  }

  // Get the legal moves by exploring all combinations of speed and flexibility
  const legalMoves = new Set<BoardCoordinate<TBoard>>();

  exploreCommanderMoves(playerSide, gameState, startingPosition);
  return legalMoves;
}
