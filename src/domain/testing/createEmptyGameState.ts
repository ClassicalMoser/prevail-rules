import type { PlayerSide, StandardBoard } from '@entities';
import type { GameStateForBoard } from '@game';
import { tempCommandCards } from '@sampleValues';
import { createEmptyStandardBoard } from '@transforms';

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
}): GameStateForBoard<StandardBoard> {
  return {
    boardState: createEmptyStandardBoard(),
    boardType: 'standard',
    cardState: {
      black: {
        awaitingPlay: tempCommandCards[0],
        burnt: [],
        discarded: [],
        inHand: [],
        inPlay: tempCommandCards[1],
        played: [],
      },
      white: {
        awaitingPlay: tempCommandCards[0],
        burnt: [],
        discarded: [],
        inHand: [],
        inPlay: tempCommandCards[1],
        played: [],
      },
    },
    currentInitiative: options?.currentInitiative ?? 'black',
    currentRoundNumber: 0,
    currentRoundState: {
      boardType: 'standard',
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
