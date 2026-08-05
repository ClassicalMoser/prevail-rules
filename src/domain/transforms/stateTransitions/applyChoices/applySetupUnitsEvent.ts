import type { Board } from '@entities';
import type { SetupUnitsEvent } from '@events';
import type { GameStateForBoard } from '@game';
import { addUnitToBoard, updateBoardState } from '@transforms/pureTransforms';

/**
 * Applies a SetupUnitsEvent to the game state.
 * Adds each unit placement to the board in order.
 * Event is assumed pre-validated (setup phase, valid placements).
 *
 * @param event - The setup units event to apply
 * @param state - The current game state
 * @returns A new game state with the units placed on the board
 */
export function applySetupUnitsEvent<TBoard extends Board>(
  event: SetupUnitsEvent,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  const { unitPlacements } = event;
  const startingBoard = state.boardState;

  // Add each unit to the board in sequence
  const newBoard: TBoard = [...unitPlacements].reduce<TBoard>(
    (board, unitPlacement) => addUnitToBoard(board, unitPlacement),
    startingBoard as TBoard,
  );

  const newGameState = updateBoardState(state, newBoard);
  return newGameState;
}
