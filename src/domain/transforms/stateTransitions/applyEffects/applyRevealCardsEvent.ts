import type { Board, GameState, PlayCardsPhaseState } from '@entities';
import type { RevealCardsEvent } from '@events';

/**
 * Applies a RevealCardsEvent to the game state.
 * Moves both players' awaitingPlay cards to inPlay, making them public.
 * Advances the play cards phase step from 'revealCards' to 'assignInitiative'.
 *
 * @param event - The reveal cards event to apply
 * @param state - The current game state
 * @returns A new game state with cards revealed
 */
export function applyRevealCardsEvent<TBoard extends Board>(
  event: RevealCardsEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const currentPhaseState = state.currentRoundState.currentPhaseState;

  if (!currentPhaseState) {
    throw new Error('No current phase state found');
  }

  if (currentPhaseState.phase !== 'playCards') {
    throw new Error('Current phase is not playCards');
  }

  if (currentPhaseState.step !== 'revealCards') {
    throw new Error('Play cards phase is not on revealCards step');
  }

  // Get both players' awaiting cards
  const whiteAwaitingCard = state.cardState.white.awaitingPlay;
  const blackAwaitingCard = state.cardState.black.awaitingPlay;

  if (!whiteAwaitingCard) {
    throw new Error('White player has no card awaiting play');
  }

  if (!blackAwaitingCard) {
    throw new Error('Black player has no card awaiting play');
  }

  // Move awaiting cards to in play
  const newWhiteCardState = {
    ...state.cardState.white,
    awaitingPlay: null,
    inPlay: whiteAwaitingCard,
  };

  const newBlackCardState = {
    ...state.cardState.black,
    awaitingPlay: null,
    inPlay: blackAwaitingCard,
  };

  // Advance to assignInitiative step
  const newPhaseState: PlayCardsPhaseState = {
    ...currentPhaseState,
    step: 'assignInitiative',
  };

  return {
    ...state,
    cardState: {
      white: newWhiteCardState,
      black: newBlackCardState,
    },
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: newPhaseState,
    },
  };
}
