import type {
  Board,
  BoardSize,
  GameState,
  LargeBoard,
  PlayerSide,
  SmallBoard,
  StandardBoard,
} from '@entities';
import {
  createEmptyLargeBoard,
  createEmptySmallBoard,
  createEmptyStandardBoard,
} from './createEmptyBoard';

/**
 * Creates an empty game state with default values.
 * - Round number starts at 0
 * - Round state has round number 1, no completed phases, no current phase, no commanded units
 * - Initiative starts with black player
 * - Board is an empty standard board
 * - Card state has empty hands, with default cards for awaitingPlay and inPlay
 * - No routed units
 *
 * @param options - Optional configuration
 * @param options.currentInitiative - Which player has initiative (defaults to 'black')
 * @param options.boardSize - The size of the board (defaults to 'standard')
 * @returns A clean game state ready for testing or game initialization
 */
export function createEmptyGameState<StandardBoard extends Board>(options: {
  currentInitiative?: PlayerSide;
  boardSize: 'standard';
}): GameState<StandardBoard>;
export function createEmptyGameState<SmallBoard extends Board>(options: {
  currentInitiative?: PlayerSide;
  boardSize: 'small';
}): GameState<SmallBoard>;
export function createEmptyGameState<LargeBoard extends Board>(options: {
  currentInitiative?: PlayerSide;
  boardSize: 'large';
}): GameState<LargeBoard>;
export function createEmptyGameState(options?: {
  currentInitiative?: PlayerSide;
}): GameState<StandardBoard>;
export function createEmptyGameState<
  TBoard extends Board = StandardBoard,
>(options?: {
  currentInitiative?: PlayerSide;
  boardSize?: BoardSize;
}): GameState<TBoard> {
  let board: TBoard;
  switch (options?.boardSize) {
    case 'large':
      board = createEmptyLargeBoard() satisfies LargeBoard as TBoard;
      break;
    case 'small':
      board = createEmptySmallBoard() satisfies SmallBoard as TBoard;
      break;
    case 'standard':
      board = createEmptyStandardBoard() satisfies StandardBoard as TBoard;
      break;
    default:
      board = createEmptyStandardBoard() satisfies StandardBoard as TBoard;
  }
  const emptyGameState: GameState<TBoard> = {
    currentRoundNumber: 0,
    currentRoundState: {
      roundNumber: 1,
      completedPhases: new Set(),
      currentPhaseState: undefined,
      commandedUnits: new Set(),
    },
    currentInitiative: options?.currentInitiative ?? 'black',
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
  return emptyGameState;
}
