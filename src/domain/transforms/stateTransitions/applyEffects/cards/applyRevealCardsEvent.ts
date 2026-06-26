import type { Board } from '@entities';
import type { RevealCardsEvent } from '@events';
import type { GameState, GameStateForBoard, PlayCardsPhaseState } from '@game';
import { getPlayCardsPhaseState } from '@queries';
import {
  revealCard,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms/pureTransforms';

/**
 * Applies a RevealCardsEvent to the game state.
 * Moves both players' awaitingPlay cards to inPlay, making them public.
 * Advances the play cards phase step to `assignInitiative`.
 *
 * Step is not re-validated; the event is trusted from the procedure / machine-generated
 * log. Phase is narrowed via `getPlayCardsPhaseState` (throws if not `playCards`).
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields.
 * @param state - The current game state
 * @returns A new game state with cards revealed
 */
export function applyRevealCardsEvent<TBoard extends Board>(
  _event: RevealCardsEvent,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  // Safe broad type cast because we know the event is for the board type
  const phaseState = getPlayCardsPhaseState(state as GameState);

  // Move both players' cards from awaitingPlay to inPlay
  const stateWithBlack = updatePlayerCardState(
    state,
    'black',
    revealCard(state.cardState.black),
  );
  const stateWithCards = updatePlayerCardState(
    stateWithBlack,
    'white',
    revealCard(state.cardState.white),
  );

  // Advance to assignInitiative step
  const newPhaseState: PlayCardsPhaseState = {
    ...phaseState,
    step: 'assignInitiative',
  };

  const stateWithPhase = updatePhaseState(stateWithCards, newPhaseState);

  return stateWithPhase;
}
