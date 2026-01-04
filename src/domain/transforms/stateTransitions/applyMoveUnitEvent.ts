/**
 * State transition for MoveUnitEvent.
 * This is a pure function that applies a unit move event to game state.
 */

import type { Board, GameState, UnitPlacement } from '@entities';
import type { MoveUnitEvent } from '@events';
import { getBoardSpace } from '@queries';
import { hasNoUnit, hasSingleUnit } from '@validation';

/**
 * Updates a unit's position on the board.
 * This is a helper function that creates a new board with the unit moved.
 */
function updateUnitPosition<TBoard extends Board>(
  board: TBoard,
  unit: MoveUnitEvent['unit'],
  from: UnitPlacement<TBoard>,
  to: UnitPlacement<TBoard>,
): TBoard {
  // Get the source and destination spaces
  const fromSpace = getBoardSpace(board, from.coordinate);
  const toSpace = getBoardSpace(board, to.coordinate);

  // Remove unit from source space
  let newFromPresence = fromSpace.unitPresence;
  if (hasSingleUnit(newFromPresence)) {
    // Unit is alone, remove it
    newFromPresence = { presenceType: 'none' };
  } else if (hasNoUnit(newFromPresence)) {
    // Already empty (shouldn't happen, but handle gracefully)
    return board;
  } else {
    // Unit is engaged - this is more complex and would need engagement resolution
    // For now, throw an error as this case needs special handling
    throw new Error(
      'Cannot move unit that is currently engaged. Resolve engagement first.',
    );
  }

  // Add unit to destination space
  const newToPresence = hasNoUnit(toSpace.unitPresence)
    ? {
        presenceType: 'single' as const,
        unit,
        facing: to.facing,
      }
    : {
        // Destination has a unit - this triggers engagement
        // For now, throw an error as engagement needs to be resolved first
        // In a full implementation, this would create an engaged state
        presenceType: 'engaged' as const,
        primaryUnit:
          toSpace.unitPresence.presenceType === 'single'
            ? toSpace.unitPresence.unit
            : toSpace.unitPresence.primaryUnit,
        primaryFacing:
          toSpace.unitPresence.presenceType === 'single'
            ? toSpace.unitPresence.facing
            : toSpace.unitPresence.primaryFacing,
        secondaryUnit: unit,
      };

  // Create new board with updated spaces
  // This is a simplified version - in practice, you'd need to handle
  // the board type generics more carefully
  return {
    ...board,
    board: {
      ...board.board,
      [from.coordinate]: {
        ...fromSpace,
        unitPresence: newFromPresence,
      },
      [to.coordinate]: {
        ...toSpace,
        unitPresence: newToPresence,
      },
    },
  } as TBoard;
}

/**
 * Applies a MoveUnitEvent to the game state.
 * This is a pure function that returns a new game state without mutating the input.
 * Preserves the board type through the transition.
 *
 * @param event - The move unit event to apply
 * @param state - The current game state
 * @returns A new game state with the unit moved
 */
export function applyMoveUnitEvent<TBoard extends Board>(
  event: MoveUnitEvent,
  state: GameState<TBoard>,
): GameState<TBoard> {
  // Update the board state
  const newBoardState = updateUnitPosition<TBoard>(
    state.boardState,
    event.unit,
    event.from,
    event.to,
  );

  // Update round state to track that this unit has moved
  const newRoundState = {
    ...state.currentRoundState,
    unitsThatMoved: new Set([
      ...state.currentRoundState.commandedUnits,
      event.unit,
    ]),
  };

  return {
    ...state,
    boardState: newBoardState,
    currentRoundState: newRoundState,
  };
}
