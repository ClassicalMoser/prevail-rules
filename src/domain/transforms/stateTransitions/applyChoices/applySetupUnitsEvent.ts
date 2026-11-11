import type { Board } from '@entities';
import type { SetupUnitsEvent } from '@events';
import type { GameState } from '@game';
import {
  addCommanderToBoard,
  addUnitToBoard,
  removeUnitFromReserve,
  updateBoardState,
} from '@transforms/pureTransforms';

/**
 * Applies a SetupUnitsEvent to the game state.
 * Adds each unit placement to the board, places the player's commander on
 * `commanderCoordinate`, and removes those units from reserve. Round 0 ends
 * after both sides have set up, with its own `roundEnd`, as every round does.
 *
 * Event is assumed pre-validated (setup phase, valid placements).
 *
 * @param event - The setup units event to apply
 * @param state - The current game state
 * @returns A new game state with the units and commander placed on the board
 */
export function applySetupUnitsEvent<S extends GameState>(
  event: SetupUnitsEvent,
  state: S,
): S {
  const { commanderCoordinate, player, unitPlacements } = event;
  const startingBoard = state.boardState;

  // Add each unit to the board in sequence, then the commander.
  const boardWithUnits: Board = [...unitPlacements].reduce(
    (board, unitPlacement) => addUnitToBoard(board, unitPlacement),
    startingBoard,
  );
  const newBoard = addCommanderToBoard(
    boardWithUnits,
    player,
    commanderCoordinate,
  );

  let newGameState = updateBoardState(state, newBoard);
  for (const unitPlacement of unitPlacements) {
    newGameState = removeUnitFromReserve(newGameState, unitPlacement.unit);
  }

  return newGameState;
}
