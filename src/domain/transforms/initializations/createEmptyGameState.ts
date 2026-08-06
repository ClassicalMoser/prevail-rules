import type { Board, GameModeName } from '@entities';
import type { GameState } from '@game';
import {
  createEmptyLargeBoard,
  createEmptySmallBoard,
  createEmptyStandardBoard,
} from './createEmptyBoard';

/**
 * Resolves which board size {@link createEmptyGameState} will use (default `standard`).
 */

function shell(board: Board): GameState {
  return {
    boardState: board,
    cardState: {
      visibility: 'authoritative',
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
      commandedUnits: [],
      completedPhases: [],
      currentPhaseState: 'none',
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
 * The return type is precise per `gameMode`; a single generic `TGameMode extends GameMode`
 * is not narrowed by `switch`, so `shell`’s `SmallGameState` / `StandardGameState` would not
 * otherwise check against `GameState<BoardForGameMode<TGameMode>>`.
 */
export function createEmptyGameState(name: GameModeName): GameState {
  switch (name) {
    case 'tutorial':
    case 'mini': {
      return shell(createEmptySmallBoard());
    }
    case 'standard': {
      return shell(createEmptyStandardBoard());
    }
    case 'epic': {
      return shell(createEmptyLargeBoard());
    }
    default: {
      const _exhaustive: never = name;
      throw new Error(`Unknown gameMode: ${_exhaustive}`);
    }
  }
}
