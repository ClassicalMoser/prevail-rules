import type { Board, GameType, SmallBoard, StandardBoard } from '@entities';
import type {
  BoardForGameType,
  GameStateWithBoard,
  SmallGameState,
  StandardGameState,
} from '@game';
import {
  createEmptySmallBoard,
  createEmptyStandardBoard,
} from './createEmptyBoard';

/**
 * Resolves which board size {@link createEmptyGameState} will use (default `standard`).
 */

function shellForBoard<TBoard extends Board>(
  board: TBoard,
): GameStateWithBoard<TBoard> {
  return {
    currentRoundNumber: 0,
    currentRoundState: {
      roundNumber: 1,
      completedPhases: new Set(),
      currentPhaseState: undefined,
      commandedUnits: new Set(),
      events: [],
    },
    currentInitiative: 'black',
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
 * `TGameType extends GameType` is not narrowed by `switch`, so `shellForBoard`’s
 * `SmallGameState` / `StandardGameState` would not otherwise check
 * against `GameStateWithBoard<BoardForGameType[TGameType]>`.
 */
export function createEmptyGameState<TGameType extends 'standard'>(
  gameType: TGameType,
): StandardGameState;
export function createEmptyGameState<TGameType extends 'mini' | 'tutorial'>(
  gameType: TGameType,
): SmallGameState;
export function createEmptyGameState<TGameType extends GameType>(
  gameType: TGameType,
): GameStateWithBoard<BoardForGameType[TGameType]>;
export function createEmptyGameState<TGameType extends GameType>(
  gameType: TGameType,
): StandardGameState | SmallGameState {
  switch (gameType) {
    case 'tutorial':
    case 'mini':
      return shellForBoard(createEmptySmallBoard());
    case 'standard':
      return shellForBoard(createEmptyStandardBoard());
    default: {
      const _exhaustive: never = gameType;
      throw new Error(`Unknown gameType: ${_exhaustive}`);
    }
  }
}
