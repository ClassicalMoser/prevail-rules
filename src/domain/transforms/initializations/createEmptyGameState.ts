import type { Board, GameModeName, LargeBoard, SmallBoard, StandardBoard } from "@entities";
import type { GameState, GameStateForBoard } from "@game";
import {
  createEmptyLargeBoard,
  createEmptySmallBoard,
  createEmptyStandardBoard,
} from "./createEmptyBoard";

/**
 * Resolves which board size {@link createEmptyGameState} will use (default `standard`).
 */

function shellForBoard<TBoard extends Board>(board: TBoard): GameStateForBoard<TBoard> {
  return {
    boardType: board.boardType as GameStateForBoard<TBoard>["boardType"],
    currentRoundNumber: 0,
    currentRoundState: {
      roundNumber: 1,
      boardType: board.boardType,
      completedPhases: new Set(),
      currentPhaseState: undefined,
      commandedUnits: new Set(),
      events: [],
    },
    currentInitiative: "black",
    boardState: board,
    cardState: {
      black: {
        inHand: [],
        awaitingPlay: null,
        inPlay: null,
        played: [],
        discarded: [],
        burnt: [],
      },
      white: {
        inHand: [],
        awaitingPlay: null,
        inPlay: null,
        played: [],
        discarded: [],
        burnt: [],
      },
    },
    reservedUnits: new Set(),
    routedUnits: new Set(),
    lostCommanders: new Set(),
  };
}

/**
 * Builds an empty game state for a given game type.
 *
 * Overloads give a precise return type per `gameType`; a single generic
 * `TGameMode extends GameMode` is not narrowed by `switch`, so `shellForBoard`’s
 * `SmallGameState` / `StandardGameState` would not otherwise check
 * against `GameStateForBoard<BoardForGameMode<TGameMode>>`.
 */

export function createEmptyGameState(name: "tutorial"): GameStateForBoard<SmallBoard>;
export function createEmptyGameState(name: "mini"): GameStateForBoard<SmallBoard>;
export function createEmptyGameState(name: "standard"): GameStateForBoard<StandardBoard>;
export function createEmptyGameState(name: "epic"): GameStateForBoard<LargeBoard>;
export function createEmptyGameState(name: GameModeName): GameState {
  switch (name) {
    case "tutorial":
    case "mini":
      return shellForBoard(createEmptySmallBoard());
    case "standard":
      return shellForBoard(createEmptyStandardBoard());
    case "epic":
      return shellForBoard(createEmptyLargeBoard());
    default: {
      const _exhaustive: never = name;
      throw new Error(`Unknown gameMode: ${_exhaustive}`);
    }
  }
}
