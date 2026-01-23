import type { GameState, PlayerSide, StandardBoard } from '@entities';
import { createEmptyStandardBoard } from '../board';

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
 * @returns A clean game state ready for testing or game initialization
 */
export function createEmptyGameState(options?: {
  currentInitiative?: PlayerSide;
}): GameState<StandardBoard> {
  return {
    currentRoundNumber: 0,
    currentRoundState: {
      roundNumber: 1,
      completedPhases: new Set(),
      currentPhaseState: undefined,
      commandedUnits: new Set(),
    },
    currentInitiative: options?.currentInitiative ?? 'black',
    boardState: createEmptyStandardBoard(),
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
