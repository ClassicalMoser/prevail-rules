import type { Board, BoardCoordinate, GameState, PlayerSide } from '@entities';
import { unitFacings } from '@entities';
import { getBoardSpace, getForwardSpace } from '@queries/boardSpace';
import { diagonalIsClear, hasEnemyUnit, isDiagonalFacing } from '@validation';

export function exploreCommanderMoves<TBoard extends Board>(
  playerSide: PlayerSide,
  startingCoordinate: BoardCoordinate<TBoard>,
  gameState: GameState<TBoard>,
  maxDistance: number,
): Set<BoardCoordinate<TBoard>> {
  // Get the board state
  const board = gameState.boardState;

  // Collect the legal moves
  const legalMoves = new Set<BoardCoordinate<TBoard>>();

  // Track the visited states to avoid revisiting
  const visitedStates = new Set<string>();
  const getStateKey = (
    coordinate: BoardCoordinate<TBoard>,
    remainingDistance: number,
  ): string => {
    return `${coordinate}|${remainingDistance}`;
  };

  // Recursive function to explore the moves
  function explore(
    currentCoordinate: BoardCoordinate<TBoard>,
    remainingDistance: number,
  ): void {
    // Check if we have already visited this state
    const stateKey = getStateKey(currentCoordinate, remainingDistance);
    if (visitedStates.has(stateKey)) {
      return;
    }
    visitedStates.add(stateKey);

    // If we have no distance remaining, we stop
    if (remainingDistance === 0) {
      return;
    }
    // Explore in each direction
    for (const facing of unitFacings) {
      // Get the next space in the direction
      const nextSpace = getForwardSpace(board, currentCoordinate, facing);
      if (nextSpace === undefined) {
        // If there is no space in the direction, we stop
        continue;
      }
      // If the facing is diagonal,
      // we need to check if we can even reach the target space
      const { result: isDiagonalFacingResult } = isDiagonalFacing(facing);
      if (isDiagonalFacingResult) {
        // Check if the enemy blocks the diagonal
        const { result: diagonalClearResult } = diagonalIsClear(
          playerSide,
          board,
          currentCoordinate,
          nextSpace,
        );
        if (!diagonalClearResult) {
          // If we cannot reach the target space, we stop
          continue;
        }
      }
      // Check if we can enter the space
      const { result: hasEnemyUnitResult } = hasEnemyUnit(
        playerSide,
        getBoardSpace(board, nextSpace),
      );
      // If we can enter the space, we add it to the legal moves
      if (!hasEnemyUnitResult) {
        legalMoves.add(nextSpace);
        // Explore the next space with one less distance remaining
        explore(nextSpace, remainingDistance - 1);
      }
    }
  }

  // Add the starting position to the legal moves
  legalMoves.add(startingCoordinate);
  // Start exploring from the starting position
  explore(startingCoordinate, maxDistance);

  // Get the set of final legal positions
  return legalMoves;
}
