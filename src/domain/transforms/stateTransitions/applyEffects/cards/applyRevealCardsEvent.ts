import type { RevealCardsEvent } from '@events';
import type { GameState } from '@game';
import { getPlayCardsPhaseState } from '@queries';
import {
  replaceCardState,
  revealBothAwaitingCards,
  updatePlayCardsStep,
} from '@transforms/pureTransforms';

/**
 * Applies a RevealCardsEvent to the game state.
 * Moves both players' awaitingPlay cards to inPlay, making them public.
 * Advances the play cards phase step to `assignInitiative`.
 *
 * Generic over the game-state **object** (`S extends GameState`): same
 * visibility member out as in. CommandCard branching lives in
 * {@link revealBothAwaitingCards}.
 *
 * Step is not re-validated; the event is trusted from the procedure / machine-generated
 * log. Phase is narrowed via `getPlayCardsPhaseState` (throws if not `playCards`).
 */
export function applyRevealCardsEvent<S extends GameState>(
  event: RevealCardsEvent,
  state: S,
): S {
  // Cards are revealed only while playing cards.
  getPlayCardsPhaseState(state);

  // Both cards turn face up together (§4.1.2), and initiative is assigned
  // next.
  const revealed = replaceCardState(
    state,
    revealBothAwaitingCards(state.cardState, {
      black: event.black,
      white: event.white,
    }),
  );
  const assigning = updatePlayCardsStep(revealed, 'assignInitiative');
  return assigning;
}
