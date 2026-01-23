import type { Board, GameState, PlayCardsPhaseState } from '@entities';
import type { RevealCardsEvent } from '@events';
import { getPlayCardsPhaseState } from '@queries';
import { revealCard, updatePhaseState } from '@transforms/pureTransforms';

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
  const phaseState = getPlayCardsPhaseState(state);

  if (phaseState.step !== 'revealCards') {
    throw new Error('Play cards phase is not on revealCards step');
  }

  // Move both players' cards from awaitingPlay to inPlay
  let newCardState = revealCard(state.cardState, 'black');
  newCardState = revealCard(newCardState, 'white');

  // Advance to assignInitiative step
  const newPhaseState: PlayCardsPhaseState = {
    ...phaseState,
    step: 'assignInitiative',
  };

  const stateWithCards = {
    ...state,
    cardState: newCardState,
  };

  const stateWithPhase = updatePhaseState(stateWithCards, newPhaseState);

  return stateWithPhase;
}
