import type { CardsLeavePlayEvent } from '@events';
import type { GameState } from '@game';
import {
  moveBothInPlayToPlayed,
  replaceCardState,
  updateCleanupStep,
} from '@transforms/pureTransforms';

/**
 * Applies a CardsLeavePlayEvent to the game state.
 * Moves both players' cards from inPlay to played pile.
 * Advances the cleanup phase step to `firstPlayerChooseRally`, preserving other cleanup
 * fields from the current phase state when present.
 *
 * Branching lives in {@link moveBothInPlayToPlayed} (CardState discriminant —
 * no visibility casts). Works for owned and hidden slices.
 *
 * Step is not re-validated; the event is trusted from the procedure / machine-generated
 * log. Phase is narrowed via `getCleanupPhaseState` (throws if not `cleanup`).
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields
 * @param state - The game opening Cleanup, each side's card still in play
 * @returns The game with both cards on their played piles, the first player
 * to choose whether to rally
 * @throws Error when the game is not in Cleanup
 */
export function applyCardsLeavePlayEvent<S extends GameState>(
  _event: CardsLeavePlayEvent,
  state: S,
): S {
  // The played cards go to the played pile, and the rallies begin (§10.3).
  // Each card in play leaves it for its owner's played pile (§4.5.1). The
  // pile is face up, so every seat moves both cards, including the
  // opponent's; there they wait for a rally, and one of them is what a rally
  // burns (§10.3.3).
  const cardsPutAway = moveBothInPlayToPlayed(state.cardState);
  const stateWithCards = replaceCardState(state, cardsPutAway);

  // The first player now decides whether to rally, and finishes before the
  // second decides (§4.5.2, §10.3.6).
  const rallying = updateCleanupStep(stateWithCards, 'firstPlayerChooseRally');

  // Both cards are out of play, and the rallies are next.
  return rallying;
}
