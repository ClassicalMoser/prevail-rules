import type {
  Board,
  BoardCoordinate,
  GameState,
  UnitFacing,
  UnitPlacement,
  UnitWithPlacement,
} from '@entities';
import { unitFacings } from '@entities';
import {
  getForwardSpace,
  getRearwardSpace,
  getSpacesBehind,
} from '@queries/boardSpace';
import { getAdjacentFacings } from '@queries/facings';
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
  const initialCoordinate = initialPlacement.coordinate;
  const initialFacing = initialPlacement.facing;
  const unitSide = unit.playerSide;

  // Get the current unit flexibility and speed
  const currentUnitFlexibility = getCurrentUnitStat(
    unit,
    'flexibility',
    gameState,
  );
  const currentUnitSpeed = getCurrentUnitStat(unit, 'speed', gameState);

  // Determine which function to use for getting next space
  const getSpaceInDirection =
    direction === 'advance' ? getForwardSpace : getRearwardSpace;

  // Cache valid retreat spaces
  const validRetreatSpaces = getSpacesBehind(
    board,
    initialCoordinate,
    initialFacing,
  );

  // Helper for checking if a space is a valid retreat space
  function isValidRetreatSpace(coordinate: BoardCoordinate<TBoard>): boolean {
    return validRetreatSpaces.has(coordinate);
  }

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

  // Collect all explored moves
  const results = new Set<MoveResult<TBoard>>();

  // Recursive function to explore moves
  const explore = (
    currentPlacement: UnitPlacement<TBoard>,
    remainingSpeed: number,
    remainingFlexibility: number,
    isTruePosition: boolean,
  ): void => {
    const { coordinate: currentCoordinate, facing: currentFacing } =
      currentPlacement;

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

    // Specific rules for our initial position.
    // We can only turn in place if we have flexibility remaining.
    // If we are advancing, we can turn to any facing.
    // If we are retreating, we can only turn to adjacent facings.
    // This block is only for initial position.
    // Other rotations are handled after move
    // to prevent repeated rotation in one space.
    if (isTruePosition) {
      // If advancing, add the initial position to the results.
      if (direction === 'advance') {
        results.add({
          placement: currentPlacement,
          flexibilityUsed: 0,
          speedUsed: 0,
        });
        // Original position is not valid for retreating.
      }
      // Sometimes we can turn in the initial position.
      if (remainingFlexibility > 0) {
        let newFacings = new Set<UnitFacing>();
        if (direction === 'retreat') {
          // For a retreat, in our initial position,
          // we can only turn to adjacent facings.
          newFacings = getAdjacentFacings(initialFacing);
        } else if (direction === 'advance') {
          // For an advance, we can turn to any facing.
          newFacings = new Set(unitFacings);
        } else {
          throw new Error('Invalid direction');
        }
        // Do not turn to the same facing.
        newFacings.delete(initialFacing);
        // Explore each new facing.
        for (const newFacing of newFacings) {
          const newPlacement: UnitPlacement<TBoard> = {
            coordinate: currentCoordinate,
            facing: newFacing,
          };
          // Add the new move result to the results set.
          const newMoveResult: MoveResult<TBoard> = {
            placement: newPlacement,
            // -1 because we're using 1 flexibility to turn.
            flexibilityUsed:
              currentUnitFlexibility - (remainingFlexibility - 1),
            speedUsed: currentUnitSpeed - remainingSpeed,
          };
          if (direction === 'advance') {
            // Advances can end in the initial position.
            results.add(newMoveResult);
          }
          // Retreats cannot end in the initial position.
          // Regardless, the initial position will always continue exploring.
          explore(
            { coordinate: currentCoordinate, facing: newFacing },
            remainingSpeed,
            remainingFlexibility - 1,
            false,
          );
        }
      }
    }

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
        const { result: isDiagonalFacingResult } =
          isDiagonalFacing(currentFacing);
        if (isDiagonalFacingResult) {
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
        let isLegalEnd = canMoveInto(
          unitSide,
          board,
          nextCoordinate,
          currentCoordinate,
          initialCoordinate,
          currentFacing,
          remainingFlexibility,
          direction,
        );

        if (direction === 'retreat') {
          if (!isValidRetreatSpace(nextCoordinate)) {
            isLegalEnd = false;
          }
        }

        // If we can move into the space, we add it to the results.
        if (isLegalEnd) {
          const newPlacement: UnitPlacement<TBoard> = {
            coordinate: nextCoordinate,
            facing: currentFacing,
          };
          const newMoveResult: MoveResult<TBoard> = {
            placement: newPlacement,
            flexibilityUsed: currentUnitFlexibility - remainingFlexibility,
            // -1 because we're using 1 speed to move.
            speedUsed: currentUnitSpeed - (remainingSpeed - 1),
          };
          results.add(newMoveResult);
        }

        // 3. Check if we can move through the space.
        let shouldContinueExploring = canMoveThrough(
          unitSide,
          currentUnitFlexibility,
          nextCoordinate,
          gameState,
        );

        if (direction === 'retreat') {
          // Retreats can only move through spaces behind the starting position.
          if (!isValidRetreatSpace(nextCoordinate)) {
            shouldContinueExploring = false;
          }
        }

        // If we can move through, we should keep exploring.
        if (shouldContinueExploring) {
          explore(
            { coordinate: nextCoordinate, facing: currentFacing },
            remainingSpeed - 1,
            remainingFlexibility,
            false,
          );
          // Also try changing facing after moving.
          if (remainingFlexibility > 0) {
            // Explore each new facing.
            for (const newFacing of unitFacings) {
              // Do not turn to the same facing.
              if (newFacing !== currentFacing) {
                const canMoveIntoNewFacing = canMoveInto(
                  unitSide,
                  board,
                  nextCoordinate,
                  currentCoordinate,
                  initialCoordinate,
                  newFacing,
                  remainingFlexibility,
                  direction,
                );
                if (canMoveIntoNewFacing) {
                  const newPlacement: UnitPlacement<TBoard> = {
                    coordinate: nextCoordinate,
                    facing: newFacing,
                  };
                  const newMoveResult: MoveResult<TBoard> = {
                    placement: newPlacement,
                    // -1 because we're using 1 flexibility to turn.
                    flexibilityUsed:
                      currentUnitFlexibility - (remainingFlexibility - 1),
                    speedUsed: currentUnitSpeed - (remainingSpeed - 1),
                  };
                  // Doesn't need to check if it's a valid retreat space
                  // because we already checked it when exploring the move.
                  results.add(newMoveResult);
                }
                // Explore the new space with the new facings.
                explore(
                  { coordinate: nextCoordinate, facing: newFacing },
                  remainingSpeed - 1,
                  remainingFlexibility - 1,
                  false,
                );
              }
            }
          }
        }
      }
    }
  };

  // Start exploring from the starting position
  explore(initialPlacement, currentUnitSpeed, currentUnitFlexibility, true);

  // Get the set of final legal positions
  return results;
}
