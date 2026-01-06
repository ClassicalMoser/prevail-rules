import type {
  Board,
  BoardCoordinate,
  GameState,
  UnitFacing,
  UnitPlacement,
  UnitWithPlacement,
} from '@entities';
import { unitFacings } from '@entities';
import { getForwardSpace, getRearwardSpace } from '@queries/boardSpace';
import { getCurrentUnitStat } from '@queries/getCurrentUnitStat';
import { canMoveInto, canMoveThrough, isDiagonalFacing } from '@validation';
import { checkDiagonalMove } from './checkDiagonalMove';

/**
 * Represents the result of an explored move.
 * @param placement - The placement of the unit after the move.
 * @param flexibilityUsed - The amount of flexibility used to reach the placement.
 * @param speedUsed - The amount of speed used to reach the placement.
 */
export interface MoveResult<TBoard extends Board> {
  placement: UnitPlacement<TBoard>;
  flexibilityUsed: number;
  speedUsed: number;
}

/**
 * Explores all possible moves for a unit using recursive exploration with memoization.
 * Handles both forward and backward movement based on configuration.
 *
 * @param gameState - The current game state
 * @param unitWithPlacement - The unit and its starting position
 * @param direction - The direction of movement: 'forward' or 'backward'
 * @returns Set of all explored move destinations with their metadata, including the amount of flexibility and speed used to reach each destination
 */
export function exploreUnitMoves<TBoard extends Board>(
  gameState: GameState<TBoard>,
  unitWithPlacement: UnitWithPlacement<TBoard>,
  direction: 'advance' | 'retreat',
): Set<MoveResult<TBoard>> {
  // Get the board state
  const board = gameState.boardState;

  // Get the unit and original placement
  const { placement: initialPlacement, unit } = unitWithPlacement;
  const unitSide = unit.playerSide;
  const currentUnitFlexibility = getCurrentUnitStat(
    unit,
    'flexibility',
    gameState,
  );
  const currentUnitSpeed = getCurrentUnitStat(unit, 'speed', gameState);

  // Determine which function to use for getting next space
  const getSpaceInDirection =
    direction === 'advance' ? getForwardSpace : getRearwardSpace;

  // Track visited states to avoid revisiting
  const visitedStates = new Set<string>();
  const getStateKey = (
    coordinate: BoardCoordinate<TBoard>,
    previousCoordinate: BoardCoordinate<TBoard> | undefined,
    facing: UnitFacing,
    remainingSpeed: number,
    remainingFlexibility: number,
  ): string => {
    if (previousCoordinate === undefined) {
      return `${coordinate}|undefined|${facing}|${remainingSpeed}|${remainingFlexibility}`;
    }
    return `${coordinate}|${previousCoordinate}|${facing}|${remainingSpeed}|${remainingFlexibility}`;
  };

  // Collect all explored moves
  const results = new Set<MoveResult<TBoard>>();

  // Original position is valid for advancing, but not for retreating.
  if (direction === 'advance') {
    results.add({
      placement: initialPlacement,
      flexibilityUsed: 0,
      speedUsed: 0,
    });
  }

  // Recursive function to explore moves
  const explore = (
    currentPlacement: UnitPlacement<TBoard>,
    previousPlacement: UnitPlacement<TBoard> | undefined,
    remainingSpeed: number,
    remainingFlexibility: number,
  ): void => {
    const { coordinate: currentCoordinate, facing: currentFacing } =
      currentPlacement;
    const previousCoordinate = previousPlacement?.coordinate ?? undefined;

    const stateKey = getStateKey(
      currentCoordinate,
      previousCoordinate,
      currentFacing,
      remainingSpeed,
      remainingFlexibility,
    );

    if (visitedStates.has(stateKey)) {
      return;
    }
    visitedStates.add(stateKey);

    // Try moving in direction if we have speed remaining
    if (remainingSpeed > 0) {
      const nextCoordinate = getSpaceInDirection(
        board,
        currentCoordinate,
        currentFacing,
      );
      // If there is no space in the direction, we stop here.
      if (nextCoordinate !== undefined) {
        // If there is a space in the direction we have three steps:
        // 1. If it is diagonal, check if we can reach it.
        // — otherwise we stop here.
        // 2. Check if we can move into it.
        // — this means we can add this position to the results.
        // 3. Check if we can move through it.
        // — this means we continue exploring the move by calling explore again.

        // 1. Check if the facing is diagonal.
        if (isDiagonalFacing(currentFacing)) {
          // If the facing is diagonal, check if we can reach the target space.
          const canReachTarget = checkDiagonalMove(
            unitSide,
            currentUnitFlexibility,
            gameState,
            currentCoordinate,
            nextCoordinate,
            currentFacing,
          );
          if (!canReachTarget) {
            // If we cannot reach the target space, we stop here.
            return;
          }
        }

        // 2. Check if we can move into the space.
        const isLegalEnd = canMoveInto(
          unitSide,
          board,
          nextCoordinate,
          currentCoordinate,
          currentCoordinate,
          currentFacing,
          remainingFlexibility,
          direction,
        );

        // If we can move into the space, we add it to the results.
        if (isLegalEnd) {
          const newPlacement: UnitPlacement<TBoard> = {
            coordinate: nextCoordinate,
            facing: currentFacing,
          };
          const newMoveResult: MoveResult<TBoard> = {
            placement: newPlacement,
            flexibilityUsed: remainingFlexibility,
            speedUsed: remainingSpeed,
          };
          results.add(newMoveResult);
        }

        // 3. Check if we can move through the space.
        let shouldContinueExploring = false;
        shouldContinueExploring = canMoveThrough(
          unitSide,
          currentUnitFlexibility,
          nextCoordinate,
          gameState,
        );

        // If we can move through, we should keep exploring.
        if (shouldContinueExploring) {
          explore(
            { coordinate: nextCoordinate, facing: currentFacing },
            currentPlacement,
            remainingSpeed - 1,
            remainingFlexibility,
          );
        }
      }
    }

    // Try changing facing if we have flexibility remaining
    if (remainingFlexibility > 0) {
      for (const newFacing of unitFacings) {
        if (newFacing !== currentFacing) {
          explore(
            { coordinate: currentCoordinate, facing: newFacing },
            currentPlacement,
            remainingSpeed,
            remainingFlexibility - 1,
          );
        }
      }
    }
  };

  // Start exploring from the starting position
  explore(
    initialPlacement,
    undefined,
    currentUnitSpeed,
    currentUnitFlexibility,
  );

  // Get the set of final legal positions
  return results;
}
