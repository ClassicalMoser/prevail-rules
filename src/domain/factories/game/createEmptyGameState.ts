import type { Board, GameModeName } from '@entities';
import type { AuthoritativeGameState } from '@game';
import { boardSizeByGameMode } from '@entities';
import { createCardState } from './createCardState';
import { createEmptyBoard } from '@factories/board';

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
    // White holds the initiative going into round one (§3.3.2), and so sets
    // up first in round 0.
    currentInitiative: 'white',
    // Nothing is on the board or in reserve yet. Both commanders wait to be
    // placed at setup.
    index: {
      commanders: { black: 'reserved', white: 'reserved' },
      units: {},
    },
    // Setup is round 0, with its own events; the first round to be played is
    // round 1, which setup starts once every unit is placed.
    currentRoundState: {
      commandedUnits: [],
      completedPhases: [],
      currentPhaseState: 'none',
      roundNumber: 0,
    },
    // No units or commanders initialized yet.
    lostCommanders: [],
    reservedUnits: [],
    routedUnits: [],
    // Nobody has won: the game has not begun.
    winner: 'pending',
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
  if (!Object.hasOwn(boardSizeByGameMode, name)) {
    throw new Error(`Unknown gameMode: ${name}`);
  }
  // Lay out an empty board of the size that mode is played on.
  const board = createEmptyBoard(boardSizeByGameMode[name]);
  const gameState = shell(board);
  return gameState;
}
