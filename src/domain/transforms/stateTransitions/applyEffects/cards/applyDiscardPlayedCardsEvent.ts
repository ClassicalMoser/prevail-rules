import type { DiscardPlayedCardsEvent } from '@events';
import type { GameState } from '@game';
import {
  moveBothInPlayToPlayed,
  replaceCardState,
  updateCleanupStep,
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
  // The played cards go to the played pile, and the rallies begin (§10.3).
  const stateWithCards = replaceCardState(
    state,
    moveBothInPlayToPlayed(state.cardState),
  );
  const rallying = updateCleanupStep(stateWithCards, 'firstPlayerChooseRally');
  return rallying;
}
