import type { Board, BoardCoordinate, GameState } from '@entities';
import type { MoveCommanderEvent } from '@events';
import {
  addCommanderToBoard,
  removeCommanderFromBoard,
} from '@transforms/pureTransforms';

export function applyMoveCommanderEvent<TBoard extends Board>(
  event: MoveCommanderEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const side = event.player;
  const originalCoordinate: BoardCoordinate<TBoard> = event.from;
  const newCoordinate: BoardCoordinate<TBoard> = event.to;
  const removedCommanderBoard = removeCommanderFromBoard<TBoard>(
    state.boardState,
    originalCoordinate,
    side,
  );
  const addedCommanderBoard = addCommanderToBoard<TBoard>(
    removedCommanderBoard,
    side,
    newCoordinate,
  );
  return {
    ...state,
    boardState: addedCommanderBoard,
  };
}
