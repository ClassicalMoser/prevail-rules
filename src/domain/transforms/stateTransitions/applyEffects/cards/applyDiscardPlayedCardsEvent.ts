import type { DiscardPlayedCardsEvent } from '@events';
import type {
  CleanupPhaseState,
  GameState,
  GameStateForVisibility,
} from '@game';
import { getCleanupPhaseState } from '@queries';
import {
  moveCardToPlayed,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms/pureTransforms';

/**
 * Applies a DiscardPlayedCardsEvent to the game state.
 * Moves both players' cards from inPlay to played pile.
 * Advances the cleanup phase step to `firstPlayerChooseRally`, preserving other cleanup
 * fields from the current phase state when present.
 *
 * Trusts authoritative visibility for owned card slices.
 *
 * Step is not re-validated; the event is trusted from the procedure / machine-generated
 * log. Phase is narrowed via `getCleanupPhaseState` (throws if not `cleanup`).
 */
export function applyDiscardPlayedCardsEvent(
  _event: DiscardPlayedCardsEvent,
  state: GameState,
): GameState {
  const authoritative = state as GameStateForVisibility<'authoritative'>;
  const phaseState = getCleanupPhaseState(authoritative);

  const stateWithWhite = updatePlayerCardState(
    authoritative,
    'white',
    moveCardToPlayed(authoritative.cardState.white),
  );
  const stateWithCards = updatePlayerCardState(
    stateWithWhite,
    'black',
    moveCardToPlayed(stateWithWhite.cardState.black),
  );

  const newPhaseState: CleanupPhaseState = {
    ...phaseState,
    step: 'firstPlayerChooseRally',
  };

  return updatePhaseState(stateWithCards, newPhaseState);
}
