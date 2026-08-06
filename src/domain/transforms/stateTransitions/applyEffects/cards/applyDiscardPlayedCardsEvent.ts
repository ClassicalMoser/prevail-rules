import type { DiscardPlayedCardsEvent } from '@events';
import type { CleanupPhaseState, GameState } from '@game';
import { getCleanupPhaseState } from '@queries';
import {
  moveBothInPlayToPlayed,
  updatePhaseState,
} from '@transforms/pureTransforms';

/**
 * Applies a DiscardPlayedCardsEvent to the game state.
 * Moves both players' cards from inPlay to played pile.
 * Advances the cleanup phase step to `firstPlayerChooseRally`, preserving other cleanup
 * fields from the current phase state when present.
 *
 * Branching lives in {@link moveBothInPlayToPlayed} (CardState discriminant —
 * no visibility casts). Works for owned and hidden slices.
 *
 * Step is not re-validated; the event is trusted from the procedure / machine-generated
 * log. Phase is narrowed via `getCleanupPhaseState` (throws if not `cleanup`).
 */
export function applyDiscardPlayedCardsEvent<S extends GameState>(
  _event: DiscardPlayedCardsEvent,
  state: S,
): S {
  const phaseState = getCleanupPhaseState(state);

  const stateWithCards = {
    ...state,
    cardState: moveBothInPlayToPlayed(state.cardState),
  };

  const newPhaseState: CleanupPhaseState = {
    ...phaseState,
    step: 'firstPlayerChooseRally',
  };

  return updatePhaseState(stateWithCards, newPhaseState);
}
