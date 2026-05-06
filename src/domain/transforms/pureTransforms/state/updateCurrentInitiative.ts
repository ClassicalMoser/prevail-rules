import type {
  Board,
  BoardType,
  LargeBoard,
  PlayerSide,
  SmallBoard,
  StandardBoard,
} from "@entities";
import type { GameState, GameStateForBoard } from "@game";

/**
 * Creates a new game state with the current initiative player updated.
 *
 * @param state - The current game state
 * @param player - The side that has initiative for the round
 * @returns A new game state with the updated initiative
 */
export function updateCurrentInitiativeForBoard<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
  player: PlayerSide,
): GameStateForBoard<TBoard> {
  return {
    ...state,
    currentInitiative: player,
  };
}

export function updateCurrentInitiative(state: GameState, player: PlayerSide): GameState {
  const board: BoardType = state.boardType;
  switch (board) {
    case "small":
      return updateCurrentInitiativeForBoard<SmallBoard>(
        state as GameStateForBoard<SmallBoard>,
        player,
      );
    case "standard":
      return updateCurrentInitiativeForBoard<StandardBoard>(
        state as GameStateForBoard<StandardBoard>,
        player,
      );
    case "large":
      return updateCurrentInitiativeForBoard<LargeBoard>(
        state as GameStateForBoard<LargeBoard>,
        player,
      );
    default: {
      const _exhaustive: never = board;
      throw new Error(`Unknown board type: ${board}`);
    }
  }
}
