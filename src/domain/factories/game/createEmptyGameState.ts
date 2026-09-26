import type { Board, GameModeName } from '@entities';
import type { GameStateForVisibility } from '@game';
import {
  createEmptyLargeBoard,
  createEmptySmallBoard,
  createEmptyStandardBoard,
} from '@factories/board';

function shell(board: Board): GameStateForVisibility<'authoritative'> {
  return {
    boardState: board,
    cardState: {
      // Game is created by authoritative engine; non-authoritative states are passed, not created.
      visibility: 'authoritative',
      // Card states begin empty before initialization.
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
    // Black always begins the game with the initiative.
    currentInitiative: 'black',
    // Round number is zero during setup.
    currentRoundNumber: 0,
    // Subject to change, as this usually represents a completed round.
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
  switch (name) {
    // Tutorial uses the small board.
    case 'tutorial':
    // Mini uses the small board.
    case 'mini': {
      return shell(createEmptySmallBoard());
    }
    // Standard uses the standard board.
    case 'standard': {
      return shell(createEmptyStandardBoard());
    }
    // Epic uses the large board.
    case 'epic': {
      return shell(createEmptyLargeBoard());
    }
    // GameModeName is a closed catalog; this keeps a drifted value from building a shell.
    default: {
      const _exhaustive: never = name;
      throw new Error(`Unknown gameMode: ${_exhaustive}`);
    }
  }
}
