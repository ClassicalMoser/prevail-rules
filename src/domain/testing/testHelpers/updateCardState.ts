import type { AuthoritativeCardState, Board } from '@entities';
import type { GameStateForBoard } from '@game';

/**
 * Test-harness helper: returns a new game state with the authoritative card
 * state replaced.
 *
 * Production code updates a single player's slice via `updatePlayerCardState`;
 * this whole-`cardState` setter exists only to set up fixtures.
 *
 * @param state - The current game state
 * @param cardState - The authoritative card state to set
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
export function updateCardState<TBoard extends Board>(
  state: GameStateForBoard<TBoard>,
  cardState: AuthoritativeCardState,
): GameStateForBoard<TBoard> {
  return {
    ...state,
    cardState,
  };
}
