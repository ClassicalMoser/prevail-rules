import type { RevealCardsEvent } from '@events';
import type { GameState } from '@game';
import { getPlayCardsPhaseState } from '@queries';
import { revealBothAwaitingCards } from '@transforms/pureTransforms';

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
  const phaseState = getPlayCardsPhaseState(state);

  return {
    ...state,
    cardState: revealBothAwaitingCards(state.cardState, {
      black: event.black,
      white: event.white,
    }),
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: {
        ...phaseState,
        step: 'assignInitiative',
      },
    },
  };
}
