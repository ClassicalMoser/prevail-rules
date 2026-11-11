import type { GameState } from '@game';
import { replaceCardState } from '@transforms';

/**
 * Test-harness helper: returns a new game state with its card state replaced,
 * by one of the same visibility.
 *
 * Production code changes a single player's cards via `updatePlayerCards`, and
 * writes a card state back with `replaceCardState`; this setter exists only to
 * set up fixtures.
 *
 * @param state - The current game state
 * @param cardState - The card state to set, of the state's own visibility
 * @returns A new game state with the updated card state
 *
 * @example
 * ```ts
 * const newState = updateCardState(state, {
 *   ...state.cardState,
 *   black: { ...state.cardState.black, inHand: [card1, card2] },
 * });
 * ```
 */
export function updateCardState<S extends GameState>(
  state: S,
  cardState: S['cardState'],
): S {
  const updated = replaceCardState(state, cardState);
  return updated;
}
