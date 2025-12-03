import type {
  Board,
  BoardCoordinate,
  BoardSpace,
  UnitFacing,
  UnitInstance,
  UnitPlacement,
} from "@entities";
import { unitFacings } from "@entities";
import { getBoardSpace, getForwardSpace } from "@functions/boardSpace";
import { getAdjacentFacings } from "@functions/facings";
import { areSameSide } from "@functions/unit";
import { hasSingleUnit } from "@functions/unitPresence";
import { isDiagonalFacing } from "@validation";
import { canEngageEnemy, canMoveInto , canMoveThrough  } from "@validation/unitMovement";

/**
 * Calculates all legal moves for a unit from a given starting position.
 * Uses recursive exploration with memoization to find all combinations of
 * movement and facing changes within the unit's speed and flexibility limits.
 *
 * @param unit - The unit for which to calculate legal moves
 * @param board - The board state to evaluate moves on
 * @param startingPosition - The current position and facing of the unit
 * @returns A set of all legal unit placements (coordinate + facing) the unit can reach
 * @throws {Error} If the unit is not free to move, not present, or facing mismatch
 */
export function getLegalUnitMoves<TBoard extends Board>(
  unit: UnitInstance,
  board: TBoard,
  startingPosition: UnitPlacement<TBoard>,
): Set<UnitPlacement<TBoard>> {
  // The reported starting position must be a valid board space
  const boardSpace: BoardSpace = getBoardSpace(
    board,
    startingPosition.coordinate,
  );
  // Check if the unit is free to move
  if (!hasSingleUnit(boardSpace.unitPresence)) {
    throw new Error("Unit at starting position is not free to move");
  }
  // Check if the reported unit is present at the starting position
  if (boardSpace.unitPresence.unit !== unit) {
    throw new Error("Unit is not present at the starting position");
  }
  // Check if the reported facing is valid
  if (boardSpace.unitPresence.facing !== startingPosition.facing) {
    throw new Error("Reported facing is inaccurate");
  }
  // Get the legal moves by exploring all combinations of speed and flexibility
  const legalMoves = new Set<UnitPlacement<TBoard>>();
  const visitedStates = new Set<string>();

  // Type alias to capture the board type for use in nested functions
  type BoardType = TBoard;

  // Helper function to create a state key for memoization
  const getStateKey = (
    coordinate: BoardCoordinate<BoardType>,
    facing: UnitFacing,
    remainingSpeed: number,
    remainingFlexibility: number,
  ): string => {
    return `${coordinate}|${facing}|${remainingSpeed}|${remainingFlexibility}`;
  };

  // Recursive function to explore all possible move sequences
  const exploreMoves = (
    currentCoordinate: BoardCoordinate<BoardType>,
    currentFacing: UnitFacing,
    remainingSpeed: number,
    remainingFlexibility: number,
    previousCoordinate: BoardCoordinate<BoardType> | undefined = undefined,
  ): void => {
    // Create state key for this position
    const stateKey = getStateKey(
      currentCoordinate,
      currentFacing,
      remainingSpeed,
      remainingFlexibility,
    );

    // If we've already explored this state, skip it
    if (visitedStates.has(stateKey)) {
      return;
    }
    visitedStates.add(stateKey);

    // Add current position as a legal move if it's valid
    // Special case: if we're at the starting position (previousCoordinate is undefined),
    // we can always stay there (it's a legal move to not move at all)
    const isStartingPosition = previousCoordinate === undefined;
    const canEndHere =
      isStartingPosition || canMoveInto(unit, board, currentCoordinate);

    if (canEndHere) {
      // Check if this is an enemy space that requires engagement validation
      const currentSpace = getBoardSpace(board, currentCoordinate);
      const isEnemySpace =
        hasSingleUnit(currentSpace.unitPresence) &&
        !areSameSide(currentSpace.unitPresence.unit, unit);

      if (isEnemySpace && previousCoordinate !== undefined) {
        // Check enemy engagement rules if moving into an enemy space
        if (
          canEngageEnemy(
            unit,
            board,
            currentCoordinate,
            currentFacing,
            previousCoordinate,
            remainingFlexibility,
            startingPosition.coordinate,
          )
        ) {
          legalMoves.add({
            coordinate: currentCoordinate,
            facing: currentFacing,
          });
        }
      } else {
        // Not an enemy space, or we're at the starting position - no engagement checks needed
        legalMoves.add({
          coordinate: currentCoordinate,
          facing: currentFacing,
        });
      }
    }

    // Try moving forward if we have speed remaining
    if (remainingSpeed > 0) {
      const forwardCoordinate = getForwardSpace(
        board,
        currentCoordinate,
        currentFacing,
      );
      if (forwardCoordinate !== undefined) {
        // We can move forward if we can either:
        // 1. Move through the space (to continue moving), OR
        // 2. Move into the space (to end our move there, e.g., engaging an enemy)
        let canContinue = false;
        let canEnd = false;
        if (isDiagonalFacing(currentFacing)) {
          // If the facing is diagonal, we need to check if we can make a diagonal move.
          // We can make a diagonal move if we can pass through any of the adjacent spaces.
          // First, get the adjacent facings.
          const adjacentFacings = getAdjacentFacings(currentFacing);
          // Then, get the forward spaces for each adjacent facing from the current position.
          const orthogonalPassThroughSpaces = Array.from(adjacentFacings)
            .map((facing) => getForwardSpace(board, currentCoordinate, facing))
            .filter((space) => space !== undefined);
          // Then, filter out the spaces that we can't move through.
          const validPassThroughSpaces = orthogonalPassThroughSpaces.filter(
            (space) => canMoveThrough(unit, board, space),
          );
          // Then, check if we can make a diagonal move.
          const canMakeDiagonalMove = validPassThroughSpaces.length > 0;
          canContinue =
            canMoveThrough(unit, board, forwardCoordinate) &&
            canMakeDiagonalMove;
          canEnd =
            canMoveInto(unit, board, forwardCoordinate) && canMakeDiagonalMove;
        } else {
          // If the facing is not diagonal,we can just check if we can move through and into the space.
          canContinue = canMoveThrough(unit, board, forwardCoordinate);
          canEnd = canMoveInto(unit, board, forwardCoordinate);
        }

        if (canContinue) {
          // Can move through - explore and continue moving from there
          exploreMoves(
            forwardCoordinate,
            currentFacing,
            remainingSpeed - 1,
            remainingFlexibility,
            currentCoordinate,
          );
        } else if (canEnd) {
          // Can move into but not through (e.g., enemy space) - explore to add as destination
          // but don't continue moving forward from there (set remainingSpeed to 0)
          exploreMoves(
            forwardCoordinate,
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
        // Only explore if it's a different facing (changing facing costs flexibility)
        if (newFacing !== currentFacing) {
          exploreMoves(
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
  exploreMoves(
    startingPosition.coordinate,
    startingPosition.facing,
    unit.unitType.speed,
    unit.unitType.flexibility,
  );

  return legalMoves;
}
