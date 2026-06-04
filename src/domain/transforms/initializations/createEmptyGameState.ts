import type {
  Board,
  GameModeName,
  LargeBoard,
  SmallBoard,
  StandardBoard,
} from '@entities';
import type { GameState, GameStateForBoard } from '@game';
import {
  createEmptyLargeBoard,
  createEmptySmallBoard,
  createEmptyStandardBoard,
} from './createEmptyBoard';

/**
 * Resolves which board size {@link createEmptyGameState} will use (default `standard`).
 */

function shellForBoard<TBoard extends Board>(
  board: TBoard,
): GameStateForBoard<TBoard> {
  return {
    boardState: board,
    boardType: board.boardType as GameStateForBoard<TBoard>['boardType'],
    cardState: {
      black: {
        awaitingPlay: null,
        burnt: [],
        discarded: [],
        inHand: [],
        inPlay: null,
        played: [],
      },
      white: {
        awaitingPlay: null,
        burnt: [],
        discarded: [],
        inHand: [],
        inPlay: null,
        played: [],
      },
    },
    currentInitiative: 'black',
    currentRoundNumber: 0,
    currentRoundState: {
      boardType: board.boardType,
      commandedUnits: [],
      completedPhases: [],
      currentPhaseState: undefined,
      events: [],
      roundNumber: 1,
    },
    lostCommanders: [],
    reservedUnits: [],
    routedUnits: [],
  };
}

/**
 * Builds an empty game state for a given game mode.
 *
 * Overloads give a precise return type per `gameMode`; a single generic
 * `TGameMode extends GameMode` is not narrowed by `switch`, so `shellForBoard`’s
 * `SmallGameState` / `StandardGameState` would not otherwise check
 * against `GameStateForBoard<BoardForGameMode<TGameMode>>`.
 */

export function createEmptyGameState(
  name: 'mini' | 'tutorial',
): GameStateForBoard<SmallBoard>;
export function createEmptyGameState(
  name: 'standard',
): GameStateForBoard<StandardBoard>;
export function createEmptyGameState(
  name: 'epic',
): GameStateForBoard<LargeBoard>;
export function createEmptyGameState(name: GameModeName): GameState {
  switch (name) {
    case 'tutorial':
    case 'mini': {
      return shellForBoard(createEmptySmallBoard());
    }
    case 'standard': {
      return shellForBoard(createEmptyStandardBoard());
    }
    case 'epic': {
      return shellForBoard(createEmptyLargeBoard());
    }
    default: {
      const _exhaustive: never = name;
      throw new Error(`Unknown gameMode: ${_exhaustive}`);
    }
  }
}
