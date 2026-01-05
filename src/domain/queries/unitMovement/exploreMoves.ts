import type {
  Board,
  BoardCoordinate,
  GameState,
  UnitFacing,
  UnitInstance,
  UnitPlacement,
} from '@entities';
import { unitFacings } from '@entities';
import { getCurrentUnitStat } from '@queries/getCurrentUnitStat';
import { canMoveThrough, isDiagonalFacing } from '@validation';
import { checkDiagonalMove } from './checkDiagonalMove';

/**
 * Configuration for move exploration.
 */
export interface MoveExplorationConfig<TBoard extends Board> {
  /** Function to get the next space in the movement direction */
  getSpaceInDirection: (
    board: TBoard,
    coordinate: BoardCoordinate<TBoard>,
    facing: UnitFacing,
  ) => BoardCoordinate<TBoard> | undefined;
  /** Function to check if unit can end movement at a coordinate */
  canEndAt: (
    unit: UnitInstance,
    board: TBoard,
    coordinate: BoardCoordinate<TBoard>,
  ) => boolean;
  /** Function called when a valid destination is found */
  onValidDestination: (
    placement: UnitPlacement<TBoard>,
    flexibilityUsed: number,
    speedUsed: number,
    previousCoordinate: BoardCoordinate<TBoard> | undefined,
    remainingFlexibility: number,
  ) => void;
  /** Optional: check if we should continue exploring from this state */
  shouldContinueExploring?: (
    flexibilityUsed: number,
    speedUsed: number,
  ) => boolean;
}

/**
 * Explores all possible moves for a unit using recursive exploration with memoization.
 * Handles both forward and backward movement based on configuration.
 *
 * @param unit - The unit to explore moves for
 * @param gameState - The current game state
 * @param startingPosition - The starting position and facing
 * @param config - Configuration for movement exploration
 */
export function exploreMoves<TBoard extends Board>(
  unit: UnitInstance,
  gameState: GameState<TBoard>,
  startingPosition: UnitPlacement<TBoard>,
  config: MoveExplorationConfig<TBoard>,
): void {
  // Get the board state
  const board = gameState.boardState;

  // Get the base values
  const currentUnitFlexibility = getCurrentUnitStat(
    unit,
    'flexibility',
    gameState,
  );
  const currentUnitSpeed = getCurrentUnitStat(unit, 'speed', gameState);

  // Track visited states to avoid revisiting
  const visitedStates = new Set<string>();
  const getStateKey = (
    coordinate: BoardCoordinate<TBoard>,
    facing: UnitFacing,
    remainingSpeed: number,
    remainingFlexibility: number,
  ): string => {
    return `${coordinate}|${facing}|${remainingSpeed}|${remainingFlexibility}`;
  };

  // Recursive function to explore moves
  const explore = (
    currentCoordinate: BoardCoordinate<TBoard>,
    currentFacing: UnitFacing,
    remainingSpeed: number,
    remainingFlexibility: number,
    previousCoordinate: BoardCoordinate<TBoard> | undefined = undefined,
  ): void => {
    // Calculate costs used
    const flexibilityUsed = currentUnitFlexibility - remainingFlexibility;
    const speedUsed = currentUnitSpeed - remainingSpeed;

    // Check if we should continue exploring
    if (
      config.shouldContinueExploring &&
      !config.shouldContinueExploring(flexibilityUsed, speedUsed)
    ) {
      return;
    }

    const stateKey = getStateKey(
      currentCoordinate,
      currentFacing,
      remainingSpeed,
      remainingFlexibility,
    );

    if (visitedStates.has(stateKey)) {
      return;
    }
    visitedStates.add(stateKey);

    // Check if current position is a valid destination
    // If we're at the starting position (previousCoordinate is undefined),
    // we can always stay there (it's a legal move to not move at all)
    // But we also need to check if we've changed facing at the starting position
    const isStartingCoordinate =
      currentCoordinate === startingPosition.coordinate;

    if (
      isStartingCoordinate ||
      config.canEndAt(unit, board, currentCoordinate)
    ) {
      // Either we're at starting coordinate (always valid) or we can end here
      config.onValidDestination(
        {
          coordinate: currentCoordinate,
          facing: currentFacing,
        },
        flexibilityUsed,
        speedUsed,
        previousCoordinate,
        remainingFlexibility,
      );
    }

    // Try moving in direction if we have speed remaining
    if (remainingSpeed > 0) {
      const nextCoordinate = config.getSpaceInDirection(
        board,
        currentCoordinate,
        currentFacing,
      );
      if (nextCoordinate !== undefined) {
        let canContinue = false;
        let canEnd = false;

        if (isDiagonalFacing(currentFacing)) {
          canContinue = checkDiagonalMove(
            unit,
            gameState,
            currentCoordinate,
            nextCoordinate,
            currentFacing,
          );
          canEnd = config.canEndAt(unit, board, nextCoordinate) && canContinue;
        } else {
          canContinue = canMoveThrough(unit, nextCoordinate, gameState);
          canEnd = config.canEndAt(unit, board, nextCoordinate);
        }

        if (canContinue) {
          explore(
            nextCoordinate,
            currentFacing,
            remainingSpeed - 1,
            remainingFlexibility,
            currentCoordinate,
          );
        } else if (canEnd) {
          explore(
            nextCoordinate,
            currentFacing,
            0,
            remainingFlexibility,
            currentCoordinate,
          );
        }
      }
    }

    // Try changing facing if we have flexibility remaining
    if (remainingFlexibility > 0) {
      for (const newFacing of unitFacings) {
        if (newFacing !== currentFacing) {
          explore(
            currentCoordinate,
            newFacing,
            remainingSpeed,
            remainingFlexibility - 1,
            previousCoordinate,
          );
        }
      }
    }
  };

  // Start exploring from the starting position
  explore(
    startingPosition.coordinate,
    startingPosition.facing,
    currentUnitSpeed,
    currentUnitFlexibility,
  );
}
