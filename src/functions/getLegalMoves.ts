import type { Board } from "src/entities/board/board.js";
import type { BoardCoordinate } from "src/entities/board/boardCoordinates.js";
import type { BoardSpace } from "src/entities/board/boardSpace.js";
import type { UnitFacing } from "src/entities/unit/unitFacing.js";
import type { UnitInstance } from "src/entities/unit/unitInstance.js";
import type { UnitPlacement } from "src/entities/unitLocation/unitPlacement.js";
import { unitFacings } from "src/entities/unit/unitFacing.js";
import { canEngageEnemy } from "src/validation/canEngageEnemy.js";
import { canMoveInto } from "src/validation/canMoveInto.js";
import { canMoveThrough } from "src/validation/canMoveThrough.js";
import { getBoardSpace } from "./boardSpace/getBoardSpace.js";

import { getForwardSpace } from "./boardSpace/getForwardSpace.js";

export function getLegalMoves<TBoard extends Board>(
  unit: UnitInstance,
  board: TBoard,
  startingPosition: UnitPlacement<TBoard>
): Set<UnitPlacement<TBoard>> {
  // The reported starting position must be a valid board space
  const boardSpace: BoardSpace = getBoardSpace(
    board,
    startingPosition.coordinate
  );
  // Check if the unit is free to move
  if (boardSpace.unitPresence.presenceType !== "single") {
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
    remainingFlexibility: number
  ): string => {
    return `${coordinate}|${facing}|${remainingSpeed}|${remainingFlexibility}`;
  };

  // Recursive function to explore all possible move sequences
  const exploreMoves = (
    currentCoordinate: BoardCoordinate<BoardType>,
    currentFacing: UnitFacing,
    remainingSpeed: number,
    remainingFlexibility: number,
    previousCoordinate: BoardCoordinate<BoardType> | undefined = undefined
  ): void => {
    // Create state key for this position
    const stateKey = getStateKey(
      currentCoordinate,
      currentFacing,
      remainingSpeed,
      remainingFlexibility
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
        currentSpace.unitPresence.presenceType === "single" &&
        currentSpace.unitPresence.unit.playerSide !== unit.playerSide;

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
            startingPosition.coordinate
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
        currentFacing
      ) as BoardCoordinate<BoardType> | undefined;
      if (forwardCoordinate !== undefined) {
        // We can move forward if we can either:
        // 1. Move through the space (to continue moving), OR
        // 2. Move into the space (to end our move there, e.g., engaging an enemy)
        const canContinue = canMoveThrough(unit, board, forwardCoordinate);
        const canEnd = canMoveInto(unit, board, forwardCoordinate);

        if (canContinue) {
          // Can move through - explore and continue moving from there
          exploreMoves(
            forwardCoordinate,
            currentFacing,
            remainingSpeed - 1,
            remainingFlexibility,
            currentCoordinate
          );
        } else if (canEnd) {
          // Can move into but not through (e.g., enemy space) - explore to add as destination
          // but don't continue moving forward from there (set remainingSpeed to 0)
          exploreMoves(
            forwardCoordinate,
            currentFacing,
            0,
            remainingFlexibility,
            currentCoordinate
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
            previousCoordinate
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
    unit.unitType.flexibility
  );

  return legalMoves;
}
