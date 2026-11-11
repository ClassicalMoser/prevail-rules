import type { Board, BoardType, GameModeName } from '@entities';
import type { AuthoritativeGameState } from '@game';
import { gameModes } from '@entities';
import { createCardState } from './createCardState';
import {
  createEmptyLargeBoard,
  createEmptySmallBoard,
  createEmptyStandardBoard,
} from '@factories/board';

// TODO(composition): this re-keys the three board factories by size, and
// `coordinateLayoutMap` already keys the layouts the same way. A board built
// from a `BoardType` would own the lookup. Settled by deciding whether
// `@factories/board` exports one.
/** The empty board for each size. Keyed by every size, so none is missed. */
const emptyBoardBySize: Record<BoardType, () => Board> = {
  large: createEmptyLargeBoard,
  small: createEmptySmallBoard,
  standard: createEmptyStandardBoard,
};

/**
 * The game before anyone has mustered: the board it is played on, empty hands
 * and piles, and a round that has not begun.
 */
function shell(board: Board): AuthoritativeGameState {
  return {
    boardState: board,
    // Authoritative because the engine creates the game; a seat's view is
    // projected from this, never created. Both sides start with empty piles.
    cardState: createCardState(),
    // Black always begins the game with the initiative.
    currentInitiative: 'black',
    // Setup is round 0, with its own events; the first round to be played is
    // round 1, which setup starts once every unit is placed.
    currentRoundState: {
      commandedUnits: [],
      completedPhases: [],
      currentPhaseState: 'none',
      events: [],
      roundNumber: 0,
    },
    // No units or commanders initialized yet.
    lostCommanders: [],
    reservedUnits: [],
    routedUnits: [],
    // The full record: both hands in view, as `cardState` above.
    visibility: 'authoritative',
  };
}

/**
 * Builds an empty game state for a given game mode name.
 * Board size follows the mode catalog (small / standard / large).
 */
export function createEmptyGameState(
  name: GameModeName,
): AuthoritativeGameState {
  // The mode catalog is the one place a mode's board size is written down;
  // the game rules check a game's board against the same catalog. A mode name
  // enters a game here, so a drifted value is refused here.
  if (!Object.hasOwn(gameModes, name)) {
    throw new Error(`Unknown gameMode: ${name}`);
  }
  // Lay out an empty board of the size that mode is played on.
  const board = emptyBoardBySize[gameModes[name].boardSize]();
  const gameState = shell(board);
  return gameState;
}
