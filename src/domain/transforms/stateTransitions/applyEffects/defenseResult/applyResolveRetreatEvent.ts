import type { Board } from "@entities";
import type { ResolveRetreatEventForBoard } from "@events";
import type { GameStateForBoard, RetreatStateForBoard } from "@game";
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
  event: ResolveRetreatEventForBoard<TBoard>,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  // Move the unit on the board
  const removedUnitBoard = removeUnitFromBoard(state.boardState, event.startingPosition);
  const addedUnitBoard = addUnitToBoard(removedUnitBoard, event.finalPosition);

  // Get the current retreat state to update
  const retreatingPlayer = event.startingPosition.unit.playerSide;
  const currentRetreatState = findRetreatState(state, retreatingPlayer);

  // Mark retreat as completed
  const newRetreatState: RetreatStateForBoard<TBoard> = {
    ...currentRetreatState,
    completed: true,
  };

  const stateWithUpdatedRetreat = updateRetreatState(state, newRetreatState);
  return updateBoardState(stateWithUpdatedRetreat, addedUnitBoard);
}
