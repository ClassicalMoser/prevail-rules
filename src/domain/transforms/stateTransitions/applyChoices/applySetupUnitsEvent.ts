import type { Board, GameState, UnitWithPlacement } from '@entities';
import type { SetupUnitsEvent } from '@events';
import { addUnitToBoard } from '@transforms/pureTransforms';

export function applySetupUnitsEvent<TBoard extends Board>(
  event: SetupUnitsEvent,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const unitPlacements = event.unitPlacements;
  const startingBoard = state.boardState;
  const newBoard = Array.from(unitPlacements).reduce(
    (board: TBoard, unitPlacement: UnitWithPlacement<TBoard>) => {
      return addUnitToBoard(board, unitPlacement);
    },
    startingBoard,
  );
  return {
    ...state,
    boardState: newBoard,
  };
}
