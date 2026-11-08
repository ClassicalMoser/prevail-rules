import type { Board, BoardType, GameModeName } from '@entities';
import type { GameStateForVisibility } from '@game';
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
function shell(board: Board): GameStateForVisibility<'authoritative'> {
  return {
    boardState: board,
    // Authoritative because the engine creates the game; a seat's view is
    // projected from this, never created. Both sides start with empty piles.
    cardState: createCardState(),
    // Black always begins the game with the initiative.
    currentInitiative: 'black',
    // Round number is zero during setup.
    currentRoundNumber: 0,
    // Subject to change, as this usually represents a completed round.
    // TODO(misleading): this round is the first one to be played, not a
    // completed one, and it waits for round 1 while `currentRoundNumber` above
    // is 0 (setup). The spec says the same. Settled by stating which round
    // this slot holds before the first round starts.
    currentRoundState: {
      commandedUnits: [],
      completedPhases: [],
      currentPhaseState: 'none',
      events: [],
      roundNumber: 1,
    },
    // No units or commanders initialized yet.
    lostCommanders: [],
    reservedUnits: [],
    routedUnits: [],
  };
}

/**
 * Builds an empty game state for a given game mode name.
 * Board size follows the mode catalog (small / standard / large).
 */
export function createEmptyGameState(
  name: GameModeName,
): GameStateForVisibility<'authoritative'> {
  // The mode catalog is the one place a mode's board size is written down;
  // the game rules check a game's board against the same catalog.
  const mode = gameModes.find((entry) => entry.name === name);
  // GameModeName is a closed catalog; this keeps a drifted value from building a shell.
  if (!mode) {
    throw new Error(`Unknown gameMode: ${name}`);
  }
  // Lay out an empty board of the size that mode is played on.
  const board = emptyBoardBySize[mode.boardSize]();
  const gameState = shell(board);
  return gameState;
}
