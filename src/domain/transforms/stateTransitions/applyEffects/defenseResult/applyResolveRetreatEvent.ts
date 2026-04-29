import type { Board, UnitWithPlacement } from "@entities";
import type { ResolveRetreatEvent } from "@events";
import type { GameStateWithBoard, RetreatState } from "@game";
import { findRetreatState } from "@queries";
import {
  addUnitToBoard,
  removeUnitFromBoard,
  updateBoardState,
  updateRetreatState,
} from "@transforms/pureTransforms";

/**
 * Applies a ResolveRetreatEvent to the game state.
 * Moves the retreating unit from startingPosition to finalPosition on the board.
 * Marks the retreat state as completed.
 *
 * @param event - The resolve retreat event to apply
 * @param state - The current game state
 * @returns A new game state with the unit moved and retreat state marked as completed
 */
export function applyResolveRetreatEvent<TBoard extends Board>(
  event: ResolveRetreatEvent<TBoard>,
  state: GameStateWithBoard<TBoard>,
): GameStateWithBoard<TBoard> {
  // Move the unit on the board
  const removedUnitBoard = removeUnitFromBoard<TBoard>(
    state.boardState,
    event.startingPosition as UnitWithPlacement<TBoard>,
  );
  const addedUnitBoard = addUnitToBoard<TBoard>(
    removedUnitBoard,
    event.finalPosition as UnitWithPlacement<TBoard>,
  );

  // Get the current retreat state to update
  const retreatingPlayer = event.startingPosition.unit.playerSide;
  const currentRetreatState = findRetreatState(state, retreatingPlayer);

  // Mark retreat as completed
  const newRetreatState: RetreatState = {
    ...currentRetreatState,
    completed: true,
  };

  const stateWithUpdatedRetreat = updateRetreatState(state, newRetreatState);
  return updateBoardState(stateWithUpdatedRetreat, addedUnitBoard);
}
