import type { RevealCardsEvent } from '@events';
import type { GameState, GameStateForVisibility, PlayCardsPhaseState } from '@game';
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
 * Trusts authoritative visibility for owned card slices.
 *
 * Step is not re-validated; the event is trusted from the procedure / machine-generated
 * log. Phase is narrowed via `getPlayCardsPhaseState` (throws if not `playCards`).
 */
export function applyRevealCardsEvent(
  _event: RevealCardsEvent,
  state: GameState,
): GameState {
  const authoritative = state as GameStateForVisibility<'authoritative'>;
  const phaseState = getPlayCardsPhaseState(authoritative);

  const stateWithBlack = updatePlayerCardState(
    authoritative,
    'black',
    revealCard(authoritative.cardState.black),
  );
  const stateWithCards = updatePlayerCardState(
    stateWithBlack,
    'white',
    revealCard(stateWithBlack.cardState.white),
  );

  const newPhaseState: PlayCardsPhaseState = {
    ...phaseState,
    step: 'assignInitiative',
  };

  return updatePhaseState(stateWithCards, newPhaseState);
}
