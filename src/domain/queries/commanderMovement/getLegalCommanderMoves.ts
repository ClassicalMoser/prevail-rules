import type { Board, BoardCoordinate, GameState, PlayerSide } from '@entities';
import { getBoardSpace } from '@queries/boardSpace';
import { COMMANDER_MOVE_DISTANCE } from '@ruleValues';
import { exploreCommanderMoves } from './exploreCommanderMoves';

export function getLegalCommanderMoves<TBoard extends Board>(
  playerSide: PlayerSide,
  gameState: GameState<TBoard>,
  startingPosition: BoardCoordinate<TBoard>,
): Set<BoardCoordinate<TBoard>> {
  // Get the maximum distance a commander can move
  const maxDistance = COMMANDER_MOVE_DISTANCE;

  // Before exploring, ensure the starting position contains the player's commander
  // Get the board state
  const board = gameState.boardState;
  // Get the space at the starting position
  const space = getBoardSpace(board, startingPosition);
  // Get the commander
  const containsCommander = space.commanders.has(playerSide);
  if (!containsCommander) {
    throw new Error('Starting position does not contain specified commander');
  }

  // Get the legal moves by exploring reachable spaces
  const legalMoves = exploreCommanderMoves(
    playerSide,
    startingPosition,
    gameState,
    maxDistance,
  );

  // Get the set of final legal positions
  return legalMoves;
}
