import type { CardState, GameState } from '@game';

/**
 * The game with its card state replaced. Cards move between piles for many
 * reasons, so the callers say how; this only writes the result back.
 *
 * @param state - The game state
 * @param cardState - The new card state, under the same visibility
 * @returns The game state holding it
 */
export function replaceCardState<S extends GameState>(
  state: S,
  cardState: CardState,
): S {
  const updated = { ...state, cardState };
  return updated;
}
